import express from 'express';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import {
  callOpenclawChat,
  getOpenclawStatus,
  isOpenclawAgentEnabled,
  openclawDisabledReply,
} from './server/openclawBridge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DIST_DIR = path.join(__dirname, 'dist');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.use(express.json({ limit: '2mb' }));

// ---------- DB ----------
const dbPath = process.env.TASK_CHAT_DB_PATH || path.join(__dirname, 'data.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');
db.pragma('temp_store = MEMORY');

// Base tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#10b981',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime TEXT NOT NULL DEFAULT 'application/octet-stream',
    size INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );
`);

// Idempotent column migration for tasks
function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
ensureColumn('tasks', 'day', "TEXT");
ensureColumn('tasks', 'priority', "TEXT NOT NULL DEFAULT 'medium'");
ensureColumn('tasks', 'status', "TEXT NOT NULL DEFAULT 'pending'");
ensureColumn('tasks', 'sort_order', "INTEGER NOT NULL DEFAULT 0");
ensureColumn('tasks', 'notes', "TEXT NOT NULL DEFAULT ''");
ensureColumn('tasks', 'assignee_ids', "TEXT NOT NULL DEFAULT '[]'");

db.exec(`UPDATE tasks SET status='done' WHERE done=1 AND status='pending'`);

// ---------- Prepared Statements (Global Scope) ----------
const STMT_GET_ATTACHMENTS_BY_TASK = db.prepare('SELECT id, filename, mime, size, created_at FROM attachments WHERE task_id=? ORDER BY id ASC');
const STMT_GET_TASK_BY_ID = db.prepare('SELECT * FROM tasks WHERE id=?');
const STMT_GET_MAX_ORDER_BY_DAY = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM tasks WHERE day IS ?');
const STMT_INSERT_TASK_FULL = db.prepare(`INSERT INTO tasks (title, day, priority, status, sort_order, notes, assignee_ids, done) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
const STMT_UPDATE_TASK = db.prepare(`UPDATE tasks SET title=?, day=?, priority=?, status=?, notes=?, assignee_ids=?, done=? WHERE id=?`);
const STMT_GET_ALL_TASKS = db.prepare('SELECT * FROM tasks ORDER BY CASE WHEN day IS NULL THEN 1 ELSE 0 END, day, sort_order ASC, created_at ASC');
const STMT_GET_TASK_ATTACHMENTS = db.prepare('SELECT stored_name FROM attachments WHERE task_id=?');
const STMT_DELETE_ATTACHMENTS_BY_TASK = db.prepare('DELETE FROM attachments WHERE task_id=?');
const STMT_DELETE_TASK = db.prepare('DELETE FROM tasks WHERE id=?');
const STMT_UPDATE_TASK_REORDER = db.prepare('UPDATE tasks SET day=?, sort_order=? WHERE id=?');
const STMT_GET_ALL_MEMBERS = db.prepare('SELECT * FROM members ORDER BY id ASC');
const STMT_INSERT_MEMBER = db.prepare('INSERT INTO members (name, color) VALUES (?, ?)');
const STMT_GET_MEMBER_BY_ID = db.prepare('SELECT * FROM members WHERE id=?');
const STMT_UPDATE_MEMBER = db.prepare('UPDATE members SET name=?, color=? WHERE id=?');
const STMT_DELETE_MEMBER = db.prepare('DELETE FROM members WHERE id=?');
const STMT_GET_TASKS_BY_ASSIGNEE = db.prepare("SELECT id, assignee_ids FROM tasks WHERE assignee_ids LIKE ?");
const STMT_UPDATE_TASK_ASSIGNEES = db.prepare('UPDATE tasks SET assignee_ids=? WHERE id=?');
const STMT_GET_ALL_REMINDERS = db.prepare('SELECT * FROM reminders ORDER BY created_at DESC');
const STMT_INSERT_REMINDER = db.prepare('INSERT INTO reminders (title, body) VALUES (?, ?)');
const STMT_DELETE_REMINDER = db.prepare('DELETE FROM reminders WHERE id=?');
const STMT_GET_REMINDER_BY_ID = db.prepare('SELECT * FROM reminders WHERE id=?');
const STMT_INSERT_ATTACHMENT = db.prepare('INSERT INTO attachments (task_id, filename, stored_name, mime, size) VALUES (?, ?, ?, ?, ?)');
const STMT_GET_ATTACHMENT_BY_ID = db.prepare('SELECT * FROM attachments WHERE id=?');
const STMT_GET_ATTACHMENT_FIELDS = db.prepare('SELECT id, filename, mime, size, created_at FROM attachments WHERE id=?');
const STMT_DELETE_ATTACHMENT = db.prepare('DELETE FROM attachments WHERE id=?');
const STMT_COUNT_TASKS = db.prepare('SELECT COUNT(*) AS n FROM tasks');
const STMT_COUNT_TASKS_BY_STATUS = db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE status=?");
const STMT_COUNT_TASKS_BY_DAY = db.prepare('SELECT COUNT(*) AS n FROM tasks WHERE day=?');
const STMT_COUNT_TASKS_NO_DAY = db.prepare('SELECT COUNT(*) AS n FROM tasks WHERE day IS NULL');
const STMT_INSERT_MESSAGE = db.prepare('INSERT INTO messages (role, text) VALUES (?, ?)');
const STMT_GET_ALL_MESSAGES = db.prepare('SELECT * FROM messages ORDER BY id ASC');
const STMT_GET_TASKS_LIST = db.prepare('SELECT id, title, status FROM tasks ORDER BY status, created_at DESC');
const STMT_INSERT_TASK = db.prepare('INSERT INTO tasks (title, sort_order) VALUES (?, ?)');
const STMT_UPDATE_TASK_DONE = db.prepare("UPDATE tasks SET status='done', done=1 WHERE id=?");
const STMT_GET_MAX_ORDER_NULL = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM tasks WHERE day IS NULL');

// ---------- Helpers ----------
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['pending', 'in_progress', 'done'];

function serializeTask(row) {
  if (!row) return row;
  let assignees = [];
  try { assignees = JSON.parse(row.assignee_ids || '[]'); } catch { assignees = []; }
  const attachments = STMT_GET_ATTACHMENTS_BY_TASK.all(row.id);
  return {
    id: row.id,
    title: row.title,
    day: row.day,
    priority: row.priority,
    status: row.status,
    sort_order: row.sort_order,
    notes: row.notes || '',
    assignee_ids: assignees,
    attachments,
    done: row.status === 'done' ? 1 : 0,
    created_at: row.created_at,
  };
}

function getTask(id) {
  const row = STMT_GET_TASK_BY_ID.get(id);
  return row ? serializeTask(row) : null;
}

// ---------- Tasks ----------
app.get('/api/tasks', (_req, res) => {
  const rows = STMT_GET_ALL_TASKS.all();
  res.json(rows.map(serializeTask));
});

app.post('/api/tasks', (req, res) => {
  const b = req.body ?? {};
  const title = (b.title ?? '').toString().trim();
  if (!title) return res.status(400).json({ error: 'title required' });
  const day = b.day && DAYS.includes(b.day) ? b.day : null;
  const priority = PRIORITIES.includes(b.priority) ? b.priority : 'medium';
  const status = STATUSES.includes(b.status) ? b.status : 'pending';
  const notes = (b.notes ?? '').toString();
  const assignees = Array.isArray(b.assignee_ids) ? b.assignee_ids.filter((x) => Number.isInteger(x)) : [];
  const maxOrder = STMT_GET_MAX_ORDER_BY_DAY.get(day).m;
  const info = STMT_INSERT_TASK_FULL.run(title, day, priority, status, maxOrder + 1, notes, JSON.stringify(assignees), status === 'done' ? 1 : 0);
  res.json(getTask(info.lastInsertRowid));
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = STMT_GET_TASK_BY_ID.get(id);
  if (!row) return res.status(404).json({ error: 'not found' });
  const b = req.body ?? {};
  const next = {
    title: b.title ?? row.title,
    day: b.day === null ? null : (b.day !== undefined && DAYS.includes(b.day) ? b.day : row.day),
    priority: PRIORITIES.includes(b.priority) ? b.priority : row.priority,
    status: STATUSES.includes(b.status) ? b.status : row.status,
    notes: b.notes !== undefined ? String(b.notes) : row.notes,
    assignee_ids: Array.isArray(b.assignee_ids)
      ? JSON.stringify(b.assignee_ids.filter((x) => Number.isInteger(x)))
      : row.assignee_ids,
  };
  if (b.done !== undefined && b.status === undefined) {
    next.status = b.done ? 'done' : 'pending';
  }
  STMT_UPDATE_TASK.run(
    next.title, next.day, next.priority, next.status, next.notes, next.assignee_ids,
    next.status === 'done' ? 1 : 0, id
  );
  res.json(getTask(id));
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const atts = STMT_GET_TASK_ATTACHMENTS.all(id);
  STMT_DELETE_ATTACHMENTS_BY_TASK.run(id);
  STMT_DELETE_TASK.run(id);
  for (const a of atts) {
    const p = path.join(UPLOAD_DIR, a.stored_name);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  res.json({ ok: true });
});

// Bulk reorder: [{ id, day, sort_order }, ...]
app.post('/api/tasks/reorder', (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const stmt = db.prepare('UPDATE tasks SET day=?, sort_order=? WHERE id=?');
  const tx = db.transaction((list) => {
    for (const it of list) {
      const day = it.day === null || it.day === undefined ? null : (DAYS.includes(it.day) ? it.day : null);
      stmt.run(day, Number(it.sort_order) || 0, Number(it.id));
    }
  });
  tx(items);
  res.json({ ok: true });
});

// ---------- Members ----------
app.get('/api/members', (_req, res) => {
  res.json(STMT_GET_ALL_MEMBERS.all());
});
app.post('/api/members', (req, res) => {
  const name = (req.body?.name ?? '').toString().trim();
  const color = (req.body?.color ?? '#10b981').toString();
  if (!name) return res.status(400).json({ error: 'name required' });
  const info = STMT_INSERT_MEMBER.run(name, color);
  res.json(STMT_GET_MEMBER_BY_ID.get(info.lastInsertRowid));
});
app.patch('/api/members/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = STMT_GET_MEMBER_BY_ID.get(id);
  if (!row) return res.status(404).json({ error: 'not found' });
  const name = req.body?.name !== undefined ? String(req.body.name) : row.name;
  const color = req.body?.color !== undefined ? String(req.body.color) : row.color;
  STMT_UPDATE_MEMBER.run(name, color, id);
  res.json(STMT_GET_MEMBER_BY_ID.get(id));
});
app.delete('/api/members/:id', (req, res) => {
  const id = Number(req.params.id);
  STMT_DELETE_MEMBER.run(id);
  const rows = STMT_GET_TASKS_BY_ASSIGNEE.all(`%${id}%`);
  for (const r of rows) {
    let list = [];
    try { list = JSON.parse(r.assignee_ids); } catch {}
    const filtered = list.filter((x) => x !== id);
    if (filtered.length !== list.length) STMT_UPDATE_TASK_ASSIGNEES.run(JSON.stringify(filtered), r.id);
  }
  res.json({ ok: true });
});

// ---------- Reminders ----------
app.get('/api/reminders', (_req, res) => {
  res.json(STMT_GET_ALL_REMINDERS.all());
});
app.post('/api/reminders', (req, res) => {
  const title = (req.body?.title ?? '').toString().trim();
  const body = (req.body?.body ?? '').toString();
  if (!title) return res.status(400).json({ error: 'title required' });
  const info = STMT_INSERT_REMINDER.run(title, body);
  res.json(STMT_GET_REMINDER_BY_ID.get(info.lastInsertRowid));
});
app.delete('/api/reminders/:id', (req, res) => {
  STMT_DELETE_REMINDER.run(Number(req.params.id));
  res.json({ ok: true });
});

// ---------- Attachments ----------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/tasks/:id/attachments', upload.array('files', 10), (req, res) => {
  const taskId = Number(req.params.id);
  const row = STMT_GET_TASK_BY_ID.get(taskId);
  if (!row) return res.status(404).json({ error: 'task not found' });
  const out = [];
  for (const f of req.files || []) {
    const info = STMT_INSERT_ATTACHMENT.run(taskId, f.originalname, f.filename, f.mimetype || '', f.size || 0);
    out.push(STMT_GET_ATTACHMENT_FIELDS.get(info.lastInsertRowid));
  }
  res.json(out);
});

app.get('/api/attachments/:id', (req, res) => {
  const row = STMT_GET_ATTACHMENT_BY_ID.get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'not found' });
  const p = path.join(UPLOAD_DIR, row.stored_name);
  if (!fs.existsSync(p)) return res.status(410).json({ error: 'file missing' });
  res.setHeader('Content-Type', row.mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(row.filename)}"`);
  fs.createReadStream(p).pipe(res);
});

app.delete('/api/attachments/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = STMT_GET_ATTACHMENT_BY_ID.get(id);
  if (!row) return res.json({ ok: true });
  STMT_DELETE_ATTACHMENT.run(id);
  const p = path.join(UPLOAD_DIR, row.stored_name);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  res.json({ ok: true });
});

// ---------- Stats ----------
app.get('/api/stats', (_req, res) => {
  const total = STMT_COUNT_TASKS.get().n;
  const done = STMT_COUNT_TASKS_BY_STATUS.get('done').n;
  const inProgress = STMT_COUNT_TASKS_BY_STATUS.get('in_progress').n;
  const pending = STMT_COUNT_TASKS_BY_STATUS.get('pending').n;
  const perDay = {};
  for (const d of [...DAYS, null]) {
    const key = d ?? 'backlog';
    perDay[key] = d ? STMT_COUNT_TASKS_BY_DAY.get(d).n : STMT_COUNT_TASKS_NO_DAY.get().n;
  }
  res.json({ total, done, in_progress: inProgress, pending, per_day: perDay });
});

// ---------- Chat (OpenClaw bridge) ----------
app.get('/api/openclaw/status', (_req, res) => {
  res.json(getOpenclawStatus());
});

app.get('/api/messages', (_req, res) => {
  res.json(STMT_GET_ALL_MESSAGES.all());
});

app.post('/api/chat', async (req, res) => {
  const text = (req.body?.text ?? '').toString().trim();
  if (!text) return res.status(400).json({ error: 'text required' });
  STMT_INSERT_MESSAGE.run('user', text);

  const lower = text.toLowerCase();
  const addMatch = text.match(/^\/?(add|ekle)\s+(.+)/i);
  const doneMatch = text.match(/^\/?(done|bitti|yapt(ı|i)m)\s+(\d+)/i);
  if (addMatch) {
    const title = addMatch[2].trim();
    const maxOrder = STMT_GET_MAX_ORDER_NULL.get().m;
    STMT_INSERT_TASK.run(title, maxOrder + 1);
    const reply = `✅ Task eklendi: ${title}`;
    STMT_INSERT_MESSAGE.run('assistant', reply);
    return res.json({ reply });
  }
  if (doneMatch) {
    const id = Number(doneMatch[3]);
    STMT_UPDATE_TASK_DONE.run(id);
    const reply = `☑ Task #${id} kapatıldı.`;
    STMT_INSERT_MESSAGE.run('assistant', reply);
    return res.json({ reply });
  }
  if (lower === '/tasks' || lower === 'görevler' || lower === 'gorevler') {
    const tasks = STMT_GET_TASKS_LIST.all();
    const sym = { pending: '☐', in_progress: '▶', done: '☑' };
    const reply = tasks.length
      ? tasks.map((t) => `${sym[t.status] || '☐'} #${t.id} ${t.title}`).join('\n')
      : 'Hiç görev yok.';
    STMT_INSERT_MESSAGE.run('assistant', reply);
    return res.json({ reply });
  }

  if (!isOpenclawAgentEnabled()) {
    const finalReply = openclawDisabledReply();
    STMT_INSERT_MESSAGE.run('assistant', finalReply);
    return res.json({ reply: finalReply, code: -1 });
  }

  const result = await callOpenclawChat(text, 'task-chat-web');
  STMT_INSERT_MESSAGE.run('assistant', result.reply);
  res.json({ reply: result.reply, code: result.ok ? 0 : -1 });
});

// ---------- Static (built SPA) ----------
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// ---------- Start ----------
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '127.0.0.1', () => {
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : PORT;
  console.log(`task-chat server on http://127.0.0.1:${port}`);
});

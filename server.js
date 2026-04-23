import express from 'express';
import Database from 'better-sqlite3';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DIST_DIR = path.join(__dirname, 'dist');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.use(express.json({ limit: '2mb' }));

// ---------- DB ----------
const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');

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
ensureColumn('tasks', 'day', "TEXT");                       // 'mon'..'sun' | NULL (backlog)
ensureColumn('tasks', 'priority', "TEXT NOT NULL DEFAULT 'medium'"); // low|medium|high
ensureColumn('tasks', 'status', "TEXT NOT NULL DEFAULT 'pending'");  // pending|in_progress|done
ensureColumn('tasks', 'sort_order', "INTEGER NOT NULL DEFAULT 0");
ensureColumn('tasks', 'notes', "TEXT NOT NULL DEFAULT ''");
ensureColumn('tasks', 'assignee_ids', "TEXT NOT NULL DEFAULT '[]'"); // JSON array of member ids

// Backfill status from legacy `done` column once
db.exec(`UPDATE tasks SET status='done' WHERE done=1 AND status='pending'`);

// ---------- Helpers ----------
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['pending', 'in_progress', 'done'];

function serializeTask(row) {
  if (!row) return row;
  let assignees = [];
  try { assignees = JSON.parse(row.assignee_ids || '[]'); } catch { assignees = []; }
  const attachments = db.prepare(
    'SELECT id, filename, mime, size, created_at FROM attachments WHERE task_id=? ORDER BY id ASC'
  ).all(row.id);
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
  const row = db.prepare('SELECT * FROM tasks WHERE id=?').get(id);
  return row ? serializeTask(row) : null;
}

// ---------- Tasks ----------
app.get('/api/tasks', (_req, res) => {
  const rows = db.prepare(
    'SELECT * FROM tasks ORDER BY CASE WHEN day IS NULL THEN 1 ELSE 0 END, day, sort_order ASC, created_at ASC'
  ).all();
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
  const maxOrder = db.prepare(
    'SELECT COALESCE(MAX(sort_order), -1) AS m FROM tasks WHERE day IS ?'
  ).get(day).m;
  const info = db.prepare(
    `INSERT INTO tasks (title, day, priority, status, sort_order, notes, assignee_ids, done)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(title, day, priority, status, maxOrder + 1, notes, JSON.stringify(assignees), status === 'done' ? 1 : 0);
  res.json(getTask(info.lastInsertRowid));
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM tasks WHERE id=?').get(id);
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
  // Legacy toggle
  if (b.done !== undefined && b.status === undefined) {
    next.status = b.done ? 'done' : 'pending';
  }
  db.prepare(
    `UPDATE tasks SET title=?, day=?, priority=?, status=?, notes=?, assignee_ids=?, done=? WHERE id=?`
  ).run(
    next.title, next.day, next.priority, next.status, next.notes, next.assignee_ids,
    next.status === 'done' ? 1 : 0, id
  );
  res.json(getTask(id));
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const atts = db.prepare('SELECT stored_name FROM attachments WHERE task_id=?').all(id);
  db.prepare('DELETE FROM attachments WHERE task_id=?').run(id);
  db.prepare('DELETE FROM tasks WHERE id=?').run(id);
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
  res.json(db.prepare('SELECT * FROM members ORDER BY id ASC').all());
});
app.post('/api/members', (req, res) => {
  const name = (req.body?.name ?? '').toString().trim();
  const color = (req.body?.color ?? '#10b981').toString();
  if (!name) return res.status(400).json({ error: 'name required' });
  const info = db.prepare('INSERT INTO members (name, color) VALUES (?, ?)').run(name, color);
  res.json(db.prepare('SELECT * FROM members WHERE id=?').get(info.lastInsertRowid));
});
app.patch('/api/members/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM members WHERE id=?').get(id);
  if (!row) return res.status(404).json({ error: 'not found' });
  const name = req.body?.name !== undefined ? String(req.body.name) : row.name;
  const color = req.body?.color !== undefined ? String(req.body.color) : row.color;
  db.prepare('UPDATE members SET name=?, color=? WHERE id=?').run(name, color, id);
  res.json(db.prepare('SELECT * FROM members WHERE id=?').get(id));
});
app.delete('/api/members/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM members WHERE id=?').run(id);
  // Remove from tasks.assignee_ids
  const rows = db.prepare("SELECT id, assignee_ids FROM tasks WHERE assignee_ids LIKE ?").all(`%${id}%`);
  const upd = db.prepare('UPDATE tasks SET assignee_ids=? WHERE id=?');
  for (const r of rows) {
    let list = [];
    try { list = JSON.parse(r.assignee_ids); } catch {}
    const filtered = list.filter((x) => x !== id);
    if (filtered.length !== list.length) upd.run(JSON.stringify(filtered), r.id);
  }
  res.json({ ok: true });
});

// ---------- Reminders ----------
app.get('/api/reminders', (_req, res) => {
  res.json(db.prepare('SELECT * FROM reminders ORDER BY created_at DESC').all());
});
app.post('/api/reminders', (req, res) => {
  const title = (req.body?.title ?? '').toString().trim();
  const body = (req.body?.body ?? '').toString();
  if (!title) return res.status(400).json({ error: 'title required' });
  const info = db.prepare('INSERT INTO reminders (title, body) VALUES (?, ?)').run(title, body);
  res.json(db.prepare('SELECT * FROM reminders WHERE id=?').get(info.lastInsertRowid));
});
app.delete('/api/reminders/:id', (req, res) => {
  db.prepare('DELETE FROM reminders WHERE id=?').run(Number(req.params.id));
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
  const row = db.prepare('SELECT id FROM tasks WHERE id=?').get(taskId);
  if (!row) return res.status(404).json({ error: 'task not found' });
  const ins = db.prepare(
    'INSERT INTO attachments (task_id, filename, stored_name, mime, size) VALUES (?, ?, ?, ?, ?)'
  );
  const out = [];
  for (const f of req.files || []) {
    const info = ins.run(taskId, f.originalname, f.filename, f.mimetype || '', f.size || 0);
    out.push(db.prepare('SELECT id, filename, mime, size, created_at FROM attachments WHERE id=?').get(info.lastInsertRowid));
  }
  res.json(out);
});

app.get('/api/attachments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM attachments WHERE id=?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'not found' });
  const p = path.join(UPLOAD_DIR, row.stored_name);
  if (!fs.existsSync(p)) return res.status(410).json({ error: 'file missing' });
  res.setHeader('Content-Type', row.mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(row.filename)}"`);
  fs.createReadStream(p).pipe(res);
});

app.delete('/api/attachments/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM attachments WHERE id=?').get(id);
  if (!row) return res.json({ ok: true });
  db.prepare('DELETE FROM attachments WHERE id=?').run(id);
  const p = path.join(UPLOAD_DIR, row.stored_name);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  res.json({ ok: true });
});

// ---------- Stats ----------
app.get('/api/stats', (_req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS n FROM tasks').get().n;
  const done = db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE status='done'").get().n;
  const inProgress = db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE status='in_progress'").get().n;
  const pending = db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE status='pending'").get().n;
  const perDay = {};
  for (const d of [...DAYS, null]) {
    const key = d ?? 'backlog';
    perDay[key] = db.prepare(
      d ? 'SELECT COUNT(*) AS n FROM tasks WHERE day=?' : 'SELECT COUNT(*) AS n FROM tasks WHERE day IS NULL'
    ).get(...(d ? [d] : [])).n;
  }
  res.json({ total, done, in_progress: inProgress, pending, per_day: perDay });
});

// ---------- Chat (OpenClaw bridge) ----------
app.get('/api/messages', (_req, res) => {
  res.json(db.prepare('SELECT * FROM messages ORDER BY id ASC').all());
});

// Warm-up: pre-start a session so first real request is faster
const warmup = spawn('openclaw', ['agent', '--json', '--session-id', 'task-chat-warmup', '-m', 'Ok'], {
  env: { ...process.env, OPENCLAW_GATEWAY_PORT: '18789' },
});
warmup.on('error', () => {});
warmup.stdin?.end();

function runOpenclaw(message) {
  return new Promise((resolve) => {
    const args = [
      'agent', '--json',
      '--session-id', 'task-chat-web',
      '-m', message,
    ];
    const proc = spawn('openclaw', args, {
      env: { ...process.env, OPENCLAW_GATEWAY_PORT: '18789' },
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({ code: -1, reply: '', stderr: 'timeout (55s)' });
    }, 55000);
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      clearTimeout(timer);
      let reply = extractReply(stdout);
      resolve({ code, reply, stderr });
    });
    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ code: -1, reply: '', stderr: String(err) });
    });
  });
}

// openclaw --json stdout can be a single JSON object or NDJSON (one JSON per line
// with intermediate tool/stream events). Extract the best user-facing text.
function extractReply(stdout) {
  const raw = (stdout || '').trim();
  if (!raw) return '';

  // try whole-blob JSON first
  try {
    const parsed = JSON.parse(raw);
    // Top-level fields
    const top =
      parsed?.finalAssistantText ||
      parsed?.finalAssistantRawText ||
      parsed?.text ||
      parsed?.reply ||
      parsed?.message ||
      parsed?.output ||
      parsed?.content;
    if (top) return String(top);
    // Nested result.payloads[0].text (openclaw agent --json format)
    const nested = parsed?.result?.payloads?.[0]?.text;
    if (nested) return String(nested);
  } catch { /* fall through to NDJSON */ }

  // NDJSON: scan bottom-up for the richest text field
  const lines = raw.split(/\r?\n/).filter(Boolean);
  let best = '';
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      const p =
        obj?.finalAssistantText ||
        obj?.finalAssistantRawText ||
        obj?.text ||
        obj?.reply ||
        obj?.message ||
        obj?.output ||
        obj?.content ||
        obj?.result?.payloads?.[0]?.text ||
        '';
      if (p && String(p).length > best.length) best = String(p);
    } catch { /* skip non-json line */ }
  }
  if (best) return best;

  // last resort: return last non-empty line (trimmed to reasonable size)
  const tail = lines[lines.length - 1] || raw;
  return tail.length > 2000 ? tail.slice(0, 2000) + '…' : tail;
}

app.post('/api/chat', async (req, res) => {
  const text = (req.body?.text ?? '').toString().trim();
  if (!text) return res.status(400).json({ error: 'text required' });
  db.prepare('INSERT INTO messages (role, text) VALUES (?, ?)').run('user', text);

  const lower = text.toLowerCase();
  const addMatch = text.match(/^\/?(add|ekle)\s+(.+)/i);
  const doneMatch = text.match(/^\/?(done|bitti|yapt(ı|i)m)\s+(\d+)/i);
  if (addMatch) {
    const title = addMatch[2].trim();
    const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM tasks WHERE day IS NULL').get().m;
    db.prepare(
      `INSERT INTO tasks (title, sort_order) VALUES (?, ?)`
    ).run(title, maxOrder + 1);
    const reply = `✅ Task eklendi: ${title}`;
    db.prepare('INSERT INTO messages (role, text) VALUES (?, ?)').run('assistant', reply);
    return res.json({ reply });
  }
  if (doneMatch) {
    const id = Number(doneMatch[3]);
    db.prepare("UPDATE tasks SET status='done', done=1 WHERE id=?").run(id);
    const reply = `☑ Task #${id} kapatıldı.`;
    db.prepare('INSERT INTO messages (role, text) VALUES (?, ?)').run('assistant', reply);
    return res.json({ reply });
  }
  if (lower === '/tasks' || lower === 'görevler' || lower === 'gorevler') {
    const tasks = db.prepare('SELECT id, title, status FROM tasks ORDER BY status, created_at DESC').all();
    const sym = { pending: '☐', in_progress: '▶', done: '☑' };
    const reply = tasks.length
      ? tasks.map((t) => `${sym[t.status] || '☐'} #${t.id} ${t.title}`).join('\n')
      : 'Hiç görev yok.';
    db.prepare('INSERT INTO messages (role, text) VALUES (?, ?)').run('assistant', reply);
    return res.json({ reply });
  }

  const { code, reply, stderr } = await runOpenclaw(text);
  const finalReply = reply || (code === 0 ? '(boş yanıt)' : `OpenClaw hata: ${stderr || 'kod=' + code}`);
  db.prepare('INSERT INTO messages (role, text) VALUES (?, ?)').run('assistant', finalReply);
  res.json({ reply: finalReply, code });
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

// Warm up OpenClaw session once at startup
runOpenclaw('Ok').catch(() => {});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`task-chat server on http://127.0.0.1:${PORT}`);
});

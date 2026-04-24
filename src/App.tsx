import { useEffect, useMemo, useState } from 'react';
import {
  useMembers,
  useReminders,
  useTasks,
  useUpdateTask,
} from './lib/queries';
import { DAY_KEYS, type Member, type Status, type Task } from './lib/types';
import { getPaperTheme, type PaperThemeKey } from './lib/paperTheme';
import { PaperDayColumn } from './components/PaperDayColumn';
import { TaskDetailModal } from './components/TaskDetailModal';
import { ChatPanel } from './components/ChatPanel';
import type { BoardBucket, BoardBuckets } from './lib/taskBoard';

const THEME_STORAGE_KEY = 'task-chat-paper-theme';

export default function App() {
  const { data: tasks = [] } = useTasks();
  const { data: members = [] } = useMembers();
  const { data: reminders = [] } = useReminders();
  const updateTask = useUpdateTask();

  const [openId, setOpenId] = useState<number | null>(null);
  const [themeKey, setThemeKey] = useState<PaperThemeKey>(() => {
    if (typeof window === 'undefined') return 'daily';
    return getPaperTheme(window.localStorage.getItem(THEME_STORAGE_KEY)).key;
  });
  const paperTheme = useMemo(() => getPaperTheme(themeKey), [themeKey]);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(paperTheme.tokens).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });
    root.dataset.paperTheme = paperTheme.key;
    root.style.colorScheme = paperTheme.colorScheme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, paperTheme.key);
    } catch {}
  }, [paperTheme]);

  const membersById = useMemo(
    () => Object.fromEntries(members.map((m) => [m.id, m])) as Record<number, Member>,
    [members],
  );

  const buckets = useMemo(() => {
    const acc: BoardBuckets = {
      mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [], backlog: [],
    };
    for (const t of (tasks as Task[])) {
      const key = (t.day ?? 'backlog') as BoardBucket;
      acc[key].push(t);
    }
    for (const k of Object.keys(acc) as BoardBucket[]) {
      acc[k].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    }
    return acc;
  }, [tasks]);

  const allTasks = tasks as Task[];
  const totalCount = allTasks.length;
  const doneCount = allTasks.filter(t => t.status === 'done').length;
  const inProgCount = allTasks.filter(t => t.status === 'in_progress').length;
  const pendingCount = allTasks.filter(t => t.status === 'pending').length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const openTask = openId != null ? allTasks.find((t) => t.id === openId) ?? null : null;

  const onToggleStatus = (id: number, next: Status) => {
    updateTask.mutate({ id, patch: { status: next } });
  };

  const mastheadText = themeKey === 'magazine' ? 'ISSUE №17' : 'VOL. 24 · NO. 17';
  const editionText = themeKey === 'magazine' ? 'MAGAZINE' : themeKey === 'nightEdition' ? 'NIGHT EDITION' : 'DAILY EDITION';

  return (
    <div className="relative min-h-screen overflow-hidden pb-32" data-paper-theme={paperTheme.key}>
      <a href="#main" className="skip-link">İçeriğe geç</a>

      {/* Theme Switcher - optional, for debugging or changing themes */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <select 
          className="bg-[color:var(--surface)] text-[color:var(--ink-primary)] border border-[color:var(--ink-primary)] px-2 py-1 font-mono text-xs"
          value={themeKey}
          onChange={(e) => setThemeKey(e.target.value as PaperThemeKey)}
        >
          <option value="daily">Daily</option>
          <option value="nightEdition">Night</option>
          <option value="magazine">Magazine</option>
        </select>
      </div>

      <main id="main" className="relative z-10 px-12 pt-12 pb-24 max-w-[1400px] mx-auto font-serif">
        
        {/* Masthead */}
        <div className="mb-9">
          <div className="flex justify-between items-baseline pb-4 border-b-[3px] border-double border-[color:var(--ink-primary)]">
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase">{mastheadText}</div>
            <div className="font-mono text-[11px] tracking-[0.14em] font-bold text-[color:var(--accent-ink)] uppercase">{editionText}</div>
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase">HAFTA 17 · NİSAN 2026</div>
          </div>
          
          <div className="py-7 text-center border-b border-[color:var(--ink-primary)]">
            <div className="font-sans text-[10px] tracking-[0.4em] uppercase text-[color:var(--ink-mute)]">
              Task Chat — Operasyon Panosu
            </div>
            <h1 className="text-[76px] font-normal my-[14px] leading-none paper-headline">
              Haftalık Planlayıcı
            </h1>
            <div className="font-sans text-[13px] text-[color:var(--ink-soft)] max-w-[560px] mx-auto leading-[1.6]">
              Takım görevlerini tek bir sayfada topla ve haftayı okunabilir bir düzende kur.
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-[repeat(4,1fr)_1.4fr] border-b border-[color:var(--ink-primary)]">
            {[
              { label: 'Toplam görev', value: totalCount },
              { label: 'Tamamlanan', value: doneCount },
              { label: 'Devam eden', value: inProgCount },
              { label: 'Bekliyor', value: pendingCount },
            ].map((s) => (
              <div key={s.label} className="p-5 border-r border-[color:var(--rule)]">
                <div className="font-sans text-[9px] tracking-[0.2em] uppercase font-semibold text-[color:var(--ink-mute)]">
                  {s.label}
                </div>
                <div className="text-[44px] font-normal mt-1 leading-none tabular-nums">
                  {s.value}
                </div>
              </div>
            ))}
            <div className="p-5">
              <div className="font-sans text-[9px] tracking-[0.2em] uppercase font-semibold text-[color:var(--ink-mute)]">
                İlerleme
              </div>
              <div className="flex items-baseline gap-2.5 mt-1">
                <div className="text-[44px] font-normal leading-none text-[color:var(--accent-ink)] paper-headline">%{progress}</div>
                <div className="font-sans text-[11px] text-[color:var(--ink-mute)]">tamamlandı</div>
              </div>
              <div className="mt-2.5 h-1 bg-[color:var(--rule-thin)]">
                <div className="h-full bg-[color:var(--accent-ink)]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Days + Sidebar */}
        <div className="grid grid-cols-[1fr_1fr_1fr_320px] gap-7">
          {DAY_KEYS.slice(0, 3).map((d) => (
            <PaperDayColumn 
              key={d} 
              dayKey={d} 
              tasks={buckets[d]} 
              membersById={membersById} 
              onOpenTask={setOpenId}
              onToggleStatus={onToggleStatus}
            />
          ))}

          {/* Sidebar */}
          <div>
            <div className="font-sans text-[9px] tracking-[0.2em] uppercase font-semibold text-[color:var(--ink-mute)] mb-2.5">
              Takım
            </div>
            <div className="border-t border-b border-[color:var(--ink-primary)] pb-2">
              {members.map(m => {
                const memberTasks = allTasks.filter(t => t.assignee_ids.includes(m.id));
                const memberDone = memberTasks.filter(t => t.status === 'done').length;
                const initials = m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <div key={m.id} className="flex items-center gap-3 py-[11px] border-b border-[color:var(--rule)] last:border-b-0">
                    <div className="p-avatar">{initials}</div>
                    <div className="flex-1">
                      <div className="font-sans text-[13px] font-medium">{m.name}</div>
                      <div className="font-mono text-[10px] text-[color:var(--ink-mute)]">{memberTasks.length} aktif · {memberDone} tamam</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="font-sans text-[9px] tracking-[0.2em] uppercase font-semibold text-[color:var(--ink-mute)] mt-6 mb-2.5">
              Hatırlatıcılar
            </div>
            <div className="border-t border-[color:var(--ink-primary)]">
              {reminders.map((r) => {
                // Determine a fake countdown purely for visuals, matching original mock if possible
                const countdownDays = Math.floor(Math.random() * 14) + 1;
                return (
                  <div key={r.id} className="py-3 border-b-[0.5px] border-[color:var(--rule)]">
                    <div className="flex justify-between items-baseline">
                      <div className="text-[14px] paper-headline font-semibold">{r.title}</div>
                      <div className="font-mono text-[10px] text-[color:var(--accent-ink)]">T−{countdownDays}g</div>
                    </div>
                    <div className="font-sans text-[11px] text-[color:var(--ink-soft)] mt-[3px]">{r.body}</div>
                  </div>
                );
              })}
            </div>

            <button className="w-full mt-5 font-sans bg-[color:var(--accent-ink)] text-[color:var(--bg-0)] border-none py-3 px-[22px] text-[12px] font-semibold tracking-[0.08em] uppercase cursor-pointer transition hover:opacity-90">
              + Yeni görev ekle
            </button>
          </div>
        </div>

        {/* Bottom 3 Days + Backlog */}
        <div className="grid grid-cols-[repeat(3,1fr)_320px] gap-7 mt-7">
          {DAY_KEYS.slice(3, 6).map((d) => (
            <PaperDayColumn 
              key={d} 
              dayKey={d} 
              tasks={buckets[d]} 
              membersById={membersById} 
              onOpenTask={setOpenId}
              onToggleStatus={onToggleStatus}
            />
          ))}
          
          {/* Backlog */}
          <div className="p-5 border border-[color:var(--ink-primary)] bg-[color:var(--paper-tint)]">
            <div className="font-sans text-[9px] tracking-[0.2em] uppercase font-semibold text-[color:var(--ink-mute)]">
              Backlog
            </div>
            <div className="text-[28px] mt-1 paper-headline">{buckets.backlog.length} görev</div>
            <div className="border-t-[0.5px] border-[color:var(--rule)] my-2.5" />
            {buckets.backlog.map(task => (
              <div key={task.id} className="font-sans text-[12px] py-2 border-b-[0.5px] border-[color:var(--rule-thin)] flex gap-2">
                <span className="font-mono text-[color:var(--ink-mute)] text-[10px]">—</span>
                <span className="flex-1 cursor-pointer hover:underline" onClick={() => setOpenId(task.id)}>{task.title}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {openTask && (
        <TaskDetailModal
          task={openTask}
          members={members}
          onClose={() => setOpenId(null)}
        />
      )}

      <ChatPanel />
    </div>
  );
}

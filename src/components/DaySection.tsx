import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';
import type { DayKey, Member, Status, Task } from '../lib/types';
import { DAY_DOT, DAY_LABELS, DAY_SHORT } from '../lib/types';
import { cn } from '../lib/utils';
import { TaskRow } from './TaskRow';

export function DaySection({
  dayKey,
  title,
  tasks,
  membersById,
  onCreate,
  onToggleStatus,
  onOpenTask,
  defaultCollapsed = false,
}: {
  dayKey: DayKey | 'backlog';
  title?: string;
  tasks: Task[];
  membersById: Record<number, Member>;
  onCreate: (title: string, day: DayKey | null) => void;
  onToggleStatus: (id: number, next: Status) => void;
  onOpenTask: (id: number) => void;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${dayKey}`,
    data: { kind: 'day', day: dayKey },
  });

  const dot = dayKey === 'backlog' ? '#a1a1aa' : DAY_DOT[dayKey];
  const label = title ?? (dayKey === 'backlog' ? 'Bekleyenler' : DAY_LABELS[dayKey]);
  const short = dayKey === 'backlog' ? 'BKL' : DAY_SHORT[dayKey];
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  const listId = `day-list-${dayKey}`;

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    onCreate(t, dayKey === 'backlog' ? null : dayKey);
    setDraft('');
    setAdding(false);
  };

  return (
    <section
      className={cn(
        'glass hover-lift relative flex flex-col overflow-hidden rounded-[24px] transition duration-300',
        isOver && 'border-info/35 shadow-[0_0_0_1px_rgba(37,99,235,0.14),0_22px_56px_-34px_rgba(37,99,235,0.32)]',
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-50"
        style={{ background: `linear-gradient(180deg, ${dot}18 0%, transparent 82%)` }}
      />

      {/* header */}
      <header className="relative flex items-center gap-3 border-b border-line px-4 py-4">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex min-w-0 items-center gap-3 text-left cursor-pointer"
          aria-expanded={!collapsed}
          aria-controls={listId}
        >
          <ChevronDown
            className={cn('h-4 w-4 text-ink-2 transition-transform', collapsed && '-rotate-90')}
          />
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[16px] border border-line bg-surface-2">
            <span
              className="h-2.5 w-2.5 rounded-full shadow-[0_0_14px_currentColor]"
              style={{ background: dot, color: dot }}
              aria-hidden
            />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-[1.05rem] font-semibold tracking-tight text-ink">
              {label}
            </div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              {short}
            </div>
          </div>
        </button>
        <div className="ml-auto flex items-center gap-3 text-[11px] text-ink-2 tabular-nums">
          <div className="rounded-full border border-line bg-surface px-2.5 py-1.5">
            {done}/{total}
          </div>
          <div
            className="relative h-2 w-20 overflow-hidden rounded-full bg-surface-4"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} ilerleme: ${done}/${total}`}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-info transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {!collapsed && (
        <div ref={setNodeRef} id={listId} className="flex flex-col gap-3 p-3">
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task, idx) => (
              <div key={task.id} className="animate-fadeUp" style={{ animationDelay: `${idx * 20}ms` }}>
                <TaskRow
                  task={task}
                  membersById={membersById}
                  onToggleStatus={onToggleStatus}
                  onOpen={onOpenTask}
                />
              </div>
            ))}
          </SortableContext>

          {tasks.length === 0 && !adding && (
            <div className="flex flex-col items-center gap-2 rounded-[18px] border border-dashed border-line bg-surface-2 px-4 py-7 text-center">
              <p className="text-sm font-medium text-ink-2">Bu gun icin gorev yok</p>
              <p className="text-xs leading-6 text-ink-3">Yeni gorev eklemek icin asagidaki alani kullanin.</p>
            </div>
          )}

          {adding ? (
            <div className="glass-soft rounded-[20px] border border-info/20 p-3">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                  if (e.key === 'Escape') {
                    setAdding(false);
                    setDraft('');
                  }
                }}
                placeholder={`${label} için yeni görev…`}
                className="w-full bg-transparent px-1.5 py-1.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-end gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setDraft('');
                  }}
                  className="rounded-full px-3 py-1.5 text-ink-2 hover:bg-surface"
                >
                  iptal
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="rounded-full bg-info px-3 py-1.5 font-semibold text-white shadow-[0_16px_32px_-22px_rgba(37,99,235,0.5)] hover:bg-blue-700"
                >
                  ekle
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-[18px] border border-dashed border-line bg-surface-2 px-3 text-[11px] font-medium text-ink-3 transition hover:border-info/35 hover:bg-surface hover:text-info cursor-pointer',
                tasks.length === 0 ? 'py-3' : 'mt-0.5 py-3',
              )}
            >
              <Plus className="h-3 w-3" />
              {tasks.length === 0 ? 'boş—görev ekle' : 'görev ekle'}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

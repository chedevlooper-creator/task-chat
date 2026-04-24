import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';
import type { DayKey, Member, Status, Task } from '../lib/types';
import { DAY_LABELS, DAY_SHORT } from '../lib/types';
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
  adding,
  onAddingChange,
  defaultCollapsed = false,
}: {
  dayKey: DayKey | 'backlog';
  title?: string;
  tasks: Task[];
  membersById: Record<number, Member>;
  onCreate: (title: string, day: DayKey | null) => void;
  onToggleStatus: (id: number, next: Status) => void;
  onOpenTask: (id: number) => void;
  adding: boolean;
  onAddingChange: (open: boolean) => void;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [draft, setDraft] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${dayKey}`,
    data: { kind: 'day', day: dayKey },
  });

  const label = title ?? (dayKey === 'backlog' ? 'Bekleyenler' : DAY_LABELS[dayKey]);
  const short = dayKey === 'backlog' ? 'BKL' : DAY_SHORT[dayKey];
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  const listId = `day-list-${dayKey}`;
  const draftId = `task-draft-${dayKey}`;

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    onCreate(t, dayKey === 'backlog' ? null : dayKey);
    setDraft('');
    onAddingChange(false);
  };

  return (
    <section
      className={cn(
        'relative flex flex-col border-t-2 border-ink pt-3 transition duration-300',
        isOver && 'bg-accent-d/50 outline outline-1 outline-accent/50',
      )}
    >
      {/* header */}
      <header className="relative flex items-start gap-3 border-b border-line-2 pb-2">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex min-w-0 items-start gap-2 text-left cursor-pointer"
          aria-expanded={!collapsed}
          aria-controls={listId}
        >
          <ChevronDown
            className={cn('mt-1 h-3.5 w-3.5 text-ink-3 transition-transform', collapsed && '-rotate-90')}
          />
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-3">
              {short}
            </div>
            <div className="truncate font-display text-2xl italic leading-none text-ink">
              {label}
            </div>
          </div>
        </button>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-ink-2 tabular-nums">
          <div
            className="border border-line bg-surface/70 px-2 py-1"
            aria-label={`${label}: ${total} görev, ${done} tamamlandı`}
          >
            {total === 0 ? '0 görev' : `${done}/${total}`}
          </div>
          <div
            className="relative h-1.5 w-16 overflow-hidden bg-surface-4"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} ilerleme: ${progress} yüzde`}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {!collapsed && (
        <div ref={setNodeRef} id={listId} className="flex flex-col py-2">
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div role="list" aria-label={`${label} görevleri`}>
              {tasks.map((task, idx) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  membersById={membersById}
                  onToggleStatus={onToggleStatus}
                  onOpen={onOpenTask}
                  style={{ animationDelay: `${idx * 20}ms` }}
                />
              ))}
            </div>
          </SortableContext>

          {tasks.length === 0 && !adding && (
            <div className="flex min-h-24 flex-col items-center justify-center gap-2 border-b border-line px-4 py-7 text-center">
              <p className="text-sm font-medium text-ink-2">
                {dayKey === 'backlog' ? 'Havuz boş.' : 'Bu gün boş.'}
              </p>
              <p className="text-xs leading-6 text-ink-3">
                {dayKey === 'backlog' ? 'Haftaya yerleşmemiş görevler burada görünür.' : 'Hazır olduğunda görev ekleyebilirsin.'}
              </p>
            </div>
          )}

          {adding ? (
            <div className="border-b border-line bg-surface/60 p-3">
              <label htmlFor={draftId} className="sr-only">
                {label} için yeni görev başlığı
              </label>
              <input
                id={draftId}
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                  if (e.key === 'Escape') {
                    onAddingChange(false);
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
                    onAddingChange(false);
                    setDraft('');
                  }}
                  className="px-3 py-1.5 text-ink-2 hover:bg-surface"
                  aria-label={`${label} görev eklemeyi iptal et`}
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="bg-accent px-3 py-1.5 font-semibold text-white hover:bg-accent-2"
                  aria-label={`${label} görevini ekle`}
                >
                  Görevi ekle
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddingChange(true)}
              className={cn(
                'mt-2 inline-flex items-center justify-center gap-1.5 border border-dashed border-line-2 bg-surface/50 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 transition hover:border-accent/60 hover:bg-accent-d hover:text-accent cursor-pointer',
                tasks.length === 0 ? 'py-3' : 'mt-0.5 py-3',
              )}
              aria-label={`${label} için görev ekle`}
            >
              <Plus className="h-3 w-3" />
              Görev ekle
            </button>
          )}
        </div>
      )}
    </section>
  );
}

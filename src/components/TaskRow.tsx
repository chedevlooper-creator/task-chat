import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Circle,
  PlayCircle,
  CheckCircle2,
  GripVertical,
  Paperclip,
  StickyNote,
  Pencil,
} from 'lucide-react';
import type { Member, Status, Task } from '../lib/types';
import { cn } from '../lib/utils';
import { PriorityBadge } from './Badge';
import { AvatarStack } from './Avatar';

const NEXT_STATUS: Record<Status, Status> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
};

function StatusIcon({ status }: { status: Status }) {
  const common = 'h-5 w-5 transition-all duration-200 ';
    if (status === 'done')
      return <CheckCircle2 className={cn(common, 'text-accent scale-110')} />;
  if (status === 'in_progress') return <PlayCircle className={cn(common, 'text-info')} />;
  return <Circle className={cn(common, 'text-ink-2 hover:text-ink')} />;
}

export function TaskRow({
  task,
  membersById,
  onToggleStatus,
  onOpen,
}: {
  task: Task;
  membersById: Record<number, Member>;
  onToggleStatus: (id: number, next: Status) => void;
  onOpen: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { kind: 'task', day: task.day ?? 'backlog' },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityStripe =
    task.priority === 'high'
      ? 'bg-danger'
      : task.priority === 'medium'
        ? 'bg-warn'
        : 'bg-ink-4';

  const assigned = task.assignee_ids.map((id) => membersById[id]).filter(Boolean) as Member[];
  const doneLooks = task.status === 'done';

  return (
    <div id={`task-${task.id}`} role="listitem" aria-live="polite"
      ref={setNodeRef}
      style={style}
      className={cn(
        'group glass-soft hover-lift relative flex items-start gap-3 overflow-hidden rounded-[var(--radius)] border border-line p-3.5 pr-3.5 transition duration-200 cursor-pointer task-row-enter',
        doneLooks && 'opacity-90',
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* priority stripe */}
      <span
        className={cn('absolute left-0 top-3 bottom-3 w-1 rounded-r-full', priorityStripe)} style={{ background: 'var(--gradient-liquid)' }}
        aria-hidden
      />

      {/* drag handle */}
      <button
        type="button"
        className="tap-target -m-1 mt-0.5 rounded-full p-1.5 text-ink-3 opacity-60 transition touch-none md:opacity-0 group-hover:bg-surface group-hover:opacity-100 focus-visible:bg-surface focus-visible:opacity-100 active:cursor-grabbing cursor-grab"
        aria-label="sürükle"
        title="Gorevi surukle"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* status toggle */}
      <button
        type="button"
        onClick={() => onToggleStatus(task.id, NEXT_STATUS[task.status])}
        className="tap-target -m-1 mt-0.5 grid shrink-0 place-items-center rounded-full border border-line bg-surface p-1.5 cursor-pointer"
        aria-label={`durum: ${task.status}, değiştirmek için tıklayın`}
        aria-pressed={task.status === 'done'}
      >
        <StatusIcon status={task.status} />
      </button>

      {/* body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => onOpen(task.id)}
            className={cn(
              'tap-target -m-1 mt-0.5 grid shrink-0 place-items-center rounded-full border border-line bg-surface p-1.5 transition-transform duration-200 hover:scale-110',
              'min-w-0 flex-1 text-left text-[15px] font-medium leading-6 transition',
              doneLooks ? 'text-ink-3 line-through decoration-ink-4' : 'text-ink hover:text-info',
            )}
          >
            {task.title}
          </button>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-2">
          {assigned.length > 0 && <AvatarStack members={assigned} />}
          {task.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1">
              <Paperclip className="h-3 w-3" /> {task.attachments.length}
            </span>
          )}
          {task.notes.trim().length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1 text-warn">
              <StickyNote className="h-3 w-3" aria-label="not var" />
              not
            </span>
          )}
        </div>
      </div>

      {/* actions */}
      <button
        type="button"
        onClick={() => onOpen(task.id)}
        className="tap-target self-start grid place-items-center rounded-full p-1.5 text-ink-3 opacity-60 transition md:opacity-0 hover:bg-surface hover:text-ink group-hover:opacity-100 cursor-pointer"
        aria-label="düzenle"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

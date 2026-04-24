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
import { STATUS_LABEL } from '../lib/types';
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
  if (status === 'done') return <CheckCircle2 className={cn(common, 'text-accent scale-110')} aria-hidden="true" />;
  if (status === 'in_progress') return <PlayCircle className={cn(common, 'text-info')} aria-hidden="true" />;
  return <Circle className={cn(common, 'text-ink-2 hover:text-ink')} aria-hidden="true" />;
}

export function TaskRow({
  task,
  membersById,
  onToggleStatus,
  onOpen,
  style: rowStyle,
}: {
  task: Task;
  membersById: Record<number, Member>;
  onToggleStatus: (id: number, next: Status) => void;
  onOpen: (id: number) => void;
  style?: React.CSSProperties;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { kind: 'task', day: task.day ?? 'backlog' },
  });

  const sortableStyle: React.CSSProperties = {
    ...rowStyle,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityStripe =
    task.priority === 'high'
      ? 'bg-accent'
      : task.priority === 'medium'
        ? 'bg-warn'
        : 'bg-ink-4';

  const assigned = task.assignee_ids.map((id) => membersById[id]).filter(Boolean) as Member[];
  const doneLooks = task.status === 'done';

  return (
    <div
      id={`task-${task.id}`}
      role="listitem"
      aria-live="polite"
      ref={setNodeRef}
      style={sortableStyle}
      className={cn(
        'task-row-enter group relative flex cursor-pointer items-start gap-2 border-b border-line px-3 py-3.5 transition duration-200 animate-fadeUp hover:bg-surface/45',
        doneLooks && 'opacity-90',
      )}
    >
      {/* priority stripe */}
      <span
        className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', priorityStripe)}
        aria-hidden
      />

      {/* drag handle */}
      <button
        type="button"
        className="tap-target -m-1 mt-0.5 grid shrink-0 place-items-center rounded-sm p-1 text-ink-2 opacity-80 transition touch-none md:opacity-70 group-hover:bg-surface group-hover:opacity-100 focus-visible:bg-surface focus-visible:opacity-100 active:cursor-grabbing cursor-grab"
        aria-label={`${task.title} görevini taşımak için sürükle`}
        title={`${task.title} görevini taşı`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* status toggle */}
      <button
        type="button"
        onClick={() => onToggleStatus(task.id, NEXT_STATUS[task.status])}
        className="tap-target -m-1 mt-0.5 grid shrink-0 place-items-center rounded-sm p-1 cursor-pointer"
        aria-label={`${task.title} durumunu ${STATUS_LABEL[NEXT_STATUS[task.status]]} olarak değiştir`}
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
              'min-h-8 min-w-0 flex-1 rounded-sm px-1 py-0.5 text-left text-[13px] font-medium leading-5 transition',
              doneLooks ? 'text-ink-3 line-through decoration-ink-4' : 'text-ink hover:text-accent',
            )}
            title={task.title}
            aria-label={`${task.title} görev ayrıntılarını aç`}
          >
            {task.title}
          </button>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-2">
          {assigned.length > 0 && <AvatarStack members={assigned} />}
          {task.attachments.length > 0 && (
            <span
              className="inline-flex items-center gap-1 border border-line bg-surface/70 px-1.5 py-0.5"
              aria-label={`${task.title} görevinde ${task.attachments.length} ek var`}
            >
              <Paperclip className="h-3 w-3" aria-hidden="true" /> {task.attachments.length}
            </span>
          )}
          {task.notes.trim().length > 0 && (
            <span
              className="inline-flex items-center gap-1 border border-line bg-surface/70 px-1.5 py-0.5 text-warn"
              aria-label={`${task.title} görevinde not var`}
            >
              <StickyNote className="h-3 w-3" aria-hidden="true" />
              not
            </span>
          )}
        </div>
      </div>

      {/* actions */}
      <button
        type="button"
        onClick={() => onOpen(task.id)}
        className="tap-target self-start grid place-items-center rounded-sm p-1.5 text-ink-4 opacity-60 transition md:opacity-0 hover:bg-surface hover:text-ink group-hover:opacity-100 cursor-pointer"
        aria-label={`${task.title} görevini düzenle`}
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

import type { Priority, Status } from '../lib/types';
import { PRIORITY_LABEL, STATUS_LABEL } from '../lib/types';
import { cn } from '../lib/utils';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    high: 'border-danger/25 bg-danger/10 text-danger',
    medium: 'border-warn/25 bg-warn/10 text-warn',
    low: 'border-line bg-surface-3 text-ink-2',
  };
  const dot: Record<Priority, string> = {
    high: 'bg-danger',
    medium: 'bg-warn',
    low: 'bg-ink-3',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]',
        map[priority],
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot[priority])} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    pending: 'border-line bg-surface-3 text-ink-2',
    in_progress: 'border-info/25 bg-info/10 text-info',
    done: 'border-accent/25 bg-accent/10 text-accent',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]',
        map[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

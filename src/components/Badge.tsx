import type { Priority, Status } from '../lib/types';
import { PRIORITY_LABEL, STATUS_LABEL } from '../lib/types';
import { cn } from '../lib/utils';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    high: 'bg-danger/10 text-danger ring-danger/20',
    medium: 'bg-warn/10 text-warn ring-warn/20',
    low: 'bg-surface-3 text-ink-2 ring-line',
  };
  const dot: Record<Priority, string> = {
    high: 'bg-danger',
    medium: 'bg-warn',
    low: 'bg-ink-3',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset',
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
    pending: 'bg-surface-3 text-ink-2 ring-line',
    in_progress: 'bg-info/10 text-info ring-info/20',
    done: 'bg-accent/10 text-accent ring-accent/20',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset',
        map[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

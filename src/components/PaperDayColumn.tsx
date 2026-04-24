import { useMemo } from 'react';
import { DAY_LABELS, DAY_SHORT, type DayKey, type Task, type Member } from '../lib/types';
import { PaperTaskRow } from './PaperTaskRow';

interface PaperDayColumnProps {
  dayKey: DayKey;
  tasks: Task[];
  membersById: Record<number, Member>;
  onOpenTask: (id: number) => void;
  onToggleStatus: (id: number, status: 'pending' | 'in_progress' | 'done') => void;
}

export function PaperDayColumn({ dayKey, tasks, membersById, onOpenTask, onToggleStatus }: PaperDayColumnProps) {
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2 border-b-2 border-[color:var(--ink-primary)]">
        <div>
          <div className="font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-mute)]">
            {DAY_SHORT[dayKey]}
          </div>
          <div className="paper-headline text-[26px] leading-none">
            {DAY_LABELS[dayKey]}
          </div>
        </div>
        <div className="font-mono text-[11px] text-[color:var(--ink-mute)]">
          {doneCount}/{tasks.length}
        </div>
      </div>
      {tasks.length === 0 ? (
        <div className="p-5 text-center font-sans text-[11px] italic text-[color:var(--ink-mute)]">
          — boş —
        </div>
      ) : (
        tasks.map((task) => (
          <PaperTaskRow 
            key={task.id} 
            task={task} 
            membersById={membersById} 
            onClick={() => onOpenTask(task.id)}
            onToggleStatus={() => onToggleStatus(task.id, task.status === 'done' ? 'pending' : 'done')}
          />
        ))
      )}
    </div>
  );
}

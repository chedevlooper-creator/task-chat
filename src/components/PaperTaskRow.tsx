import { PRIORITY_LABEL, type Member, type Task } from '../lib/types';

interface PaperTaskRowProps {
  task: Task;
  membersById: Record<number, Member>;
  onClick: () => void;
  onToggleStatus: () => void;
}

export function PaperTaskRow({ task, membersById, onClick, onToggleStatus }: PaperTaskRowProps) {
  const prioMark = { high: '●', medium: '◐', low: '○' };
  
  const prioColor = task.priority === 'high' 
    ? 'var(--accent-ink)' 
    : task.priority === 'medium' 
      ? 'var(--warn)' 
      : 'var(--ink-mute)';

  const members = task.assignee_ids.map((id) => membersById[id]).filter(Boolean);

  return (
    <div className="border-b-[0.5px] border-[color:var(--rule-thin)] px-4 py-[14px] row-hover cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-2.5">
        <button 
          className="mt-[2px] w-[14px] font-sans text-[12px] tap-target" 
          style={{ color: prioColor }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus();
          }}
        >
          {task.status === 'done' ? '✓' : prioMark[task.priority]}
        </button>
        <div className="flex-1">
          <div 
            className="font-sans text-[13px] font-medium leading-[1.4]"
            style={{
              textDecoration: task.status === 'done' ? 'line-through' : 'none',
              color: task.status === 'done' ? 'var(--ink-mute)' : 'var(--ink-primary)',
            }}
          >
            {task.title}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div 
              className="font-mono text-[9px] tracking-[0.1em]" 
              style={{ color: prioColor }}
            >
              {PRIORITY_LABEL[task.priority]}
            </div>
            <div className="flex">
              {members.slice(0, 3).map((m, i) => {
                const initials = m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <div 
                    key={m.id} 
                    className="p-avatar border border-[color:var(--bg-0)]"
                    style={{ 
                      width: 20, 
                      height: 20, 
                      fontSize: 8, 
                      marginLeft: i === 0 ? 0 : -4 
                    }}
                    title={m.name}
                  >
                    {initials}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

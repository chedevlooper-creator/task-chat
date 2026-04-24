import { initials } from '../lib/utils';
import type { Member } from '../lib/types';

export function Avatar({ member, size = 22 }: { member: Member; size?: number }) {
  return (
    <span
      title={member.name}
      aria-hidden="true"
      className="inline-flex items-center justify-center border border-ink/20 text-[9px] font-bold shadow-none"
      style={{
        width: size,
        height: size,
        background: member.color,
        color: '#ffffff',
      }}
    >
      {initials(member.name) || '?'}
    </span>
  );
}

export function AvatarStack({ members, max = 3 }: { members: Member[]; max?: number }) {
  const visible = members.slice(0, max);
  const extra = members.length - visible.length;
  const label =
    visible.length === 0
      ? 'Atanan yok'
      : `Atananlar: ${visible.map((m) => m.name).join(', ')}${extra > 0 ? ` ve ${extra} kişi daha` : ''}`;

  return (
    <div className="flex items-center -space-x-1.5" role="img" aria-label={label}>
      {visible.map((m) => (
        <span
          key={m.id}
          className="overflow-hidden ring-2 ring-surface"
        >
          <Avatar member={m} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="inline-flex h-[22px] min-w-[22px] items-center justify-center border border-line bg-surface px-1.5 text-[10px] font-semibold text-ink-2 ring-2 ring-surface"
          aria-hidden="true"
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

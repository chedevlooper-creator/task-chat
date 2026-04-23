import { initials } from '../lib/utils';
import type { Member } from '../lib/types';

export function Avatar({ member, size = 22 }: { member: Member; size?: number }) {
  return (
    <span
      title={member.name}
      aria-label={member.name}
      className="inline-flex items-center justify-center rounded-full border border-white/70 text-[10px] font-semibold shadow-[0_10px_24px_-18px_rgba(15,23,42,0.26)]"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${member.color}, ${member.color}aa)`,
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
  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((m) => (
        <span
          key={m.id}
          className="overflow-hidden rounded-full ring-2 ring-surface"
        >
          <Avatar member={m} />
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full border border-line bg-surface px-1.5 text-[10px] font-semibold text-ink-2 ring-2 ring-surface">
          +{extra}
        </span>
      )}
    </div>
  );
}

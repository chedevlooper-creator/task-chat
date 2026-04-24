import { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import type { Task } from '../lib/types';
import {
  useCreateMember,
  useDeleteMember,
  useMembers,
  useTasks,
} from '../lib/queries';
import { Avatar } from './Avatar';
import { cn } from '../lib/utils';

const PALETTE = [
  '#2563eb', '#0f766e', '#0891b2', '#4f46e5', '#475569',
  '#1d4ed8', '#0f766e', '#0369a1', '#4338ca', '#334155',
];
const randomColor = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];

export function TeamPanel() {
  const { data: members = [] } = useMembers();
  const { data: tasks = [] } = useTasks();
  const create = useCreateMember();
  const del = useDeleteMember();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);

  const counts = (id: number) => {
    const assigned = (tasks as Task[]).filter((t) => t.assignee_ids.includes(id));
    return {
      total: assigned.length,
      done: assigned.filter((t) => t.status === 'done').length,
      active: assigned.filter((t) => t.status !== 'done').length,
    };
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    create.mutate({ name: trimmed, color });
    setName('');
    setColor(randomColor());
  };

  const deleteMember = (id: number, memberName: string) => {
    if (confirm(`${memberName} ekipten çıkarılsın mı? Atanmış görevlerdeki kişi bilgisi de kaldırılır.`)) {
      del.mutate(id);
    }
  };

  const nameInputId = 'team-member-name';

  return (
    <section className="paper-panel pt-3">
      <header className="mb-2 flex items-baseline gap-2">
        <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-2">
          Takım
        </h2>
        <span className="ml-auto font-mono text-[10px] text-ink-2">
          {members.length} üye
        </span>
      </header>

      <form onSubmit={submit} className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setColor(randomColor())}
          className="tap-target shrink-0 border border-line-2"
          style={{ background: color }}
          aria-label="Yeni üye rengini değiştir"
        />
        <label htmlFor={nameInputId} className="sr-only">
          Yeni üye adı
        </label>
        <input
          id={nameInputId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="yeni üye adı…"
          className="min-h-11 flex-1 border border-line-2 bg-surface/85 px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-3 focus:border-accent/60 focus:ring-0"
        />
        <button
          type="submit"
          disabled={create.isPending || name.trim().length === 0}
          className="tap-target inline-flex shrink-0 items-center justify-center bg-accent text-bg hover:bg-accent-2 disabled:opacity-40 disabled:hover:bg-accent"
          aria-label="Yeni üyeyi takıma ekle"
        >
          <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>

      <ul className="border-t border-b border-ink">
        {members.length === 0 && (
          <li className="py-4 text-center font-sans text-xs text-ink-3">
            Takımda henüz üye yok.
          </li>
        )}
        {members.map((m, idx) => {
          const c = counts(m.id);
          return (
            <li
              key={m.id}
              className={cn(
                'group row-hover flex items-center gap-3 py-2.5',
                idx !== members.length - 1 && 'border-b border-line',
              )}
            >
              <Avatar member={m} size={26} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-sans text-[13px] font-medium text-ink">{m.name}</div>
                <div className="font-mono text-[10px] text-ink-2 tabular-nums">
                  {c.active} aktif · {c.done} tamam
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteMember(m.id, m.name)}
                disabled={del.isPending}
                className="tap-target rounded-sm p-1.5 text-ink-3 opacity-85 transition hover:bg-surface hover:text-danger disabled:opacity-35 group-hover:opacity-100"
                aria-label={`${m.name} üyesini sil`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

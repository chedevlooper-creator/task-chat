import { useState } from 'react';
import { Trash2, UserPlus, Users } from 'lucide-react';
import type { Task } from '../lib/types';
import {
  useCreateMember,
  useDeleteMember,
  useMembers,
  useTasks,
} from '../lib/queries';
import { Avatar } from './Avatar';

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

  return (
    <section className="glass rounded-[24px] p-4 sm:p-5">
      <header className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-info" />
        <h2 className="font-display text-lg font-semibold tracking-tight">Takım</h2>
        <span className="ml-auto rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-ink-3">{members.length} üye</span>
      </header>

      <form onSubmit={submit} className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setColor(randomColor())}
          className="h-9 w-9 shrink-0 rounded-full border border-white/70 shadow-[0_10px_18px_-14px_rgba(15,23,42,0.24)]"
          style={{ background: color }}
          aria-label="renk"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="yeni üye adı…"
          className="flex-1 rounded-[16px] border border-line bg-surface px-3 py-2.5 text-sm focus:border-info/30 focus:ring-0"
        />
        <button
          type="submit"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px] bg-info text-white shadow-[0_16px_30px_-20px_rgba(37,99,235,0.45)] hover:bg-blue-700"
          aria-label="üye ekle"
        >
          <UserPlus className="h-3.5 w-3.5" />
        </button>
      </form>

      <ul className="space-y-1">
        {members.length === 0 && (
          <li className="rounded-[18px] border border-dashed border-line bg-surface-2 py-4 text-center text-xs text-ink-3">
            Takimda henuz uye yok.
          </li>
        )}
        {members.map((m) => {
          const c = counts(m.id);
          return (
            <li
              key={m.id}
              className="group glass-soft row-hover flex items-center gap-3 rounded-[18px] px-3 py-2.5"
            >
              <Avatar member={m} size={24} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-ink">{m.name}</div>
                <div className="text-[10px] text-ink-3 tabular-nums">
                  {c.done}/{c.total} tamamlandı
                </div>
              </div>
              <button
                type="button"
                onClick={() => del.mutate(m.id)}
                className="rounded-full p-1.5 text-ink-3 opacity-70 transition hover:bg-surface hover:text-danger group-hover:opacity-100"
                aria-label={`${m.name} sil`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

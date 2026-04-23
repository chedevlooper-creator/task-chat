import { useState } from 'react';
import { StickyNote, Trash2, Plus } from 'lucide-react';
import {
  useCreateReminder,
  useDeleteReminder,
  useReminders,
} from '../lib/queries';

export function RemindersPanel() {
  const { data: reminders = [] } = useReminders();
  const create = useCreateReminder();
  const del = useDeleteReminder();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    create.mutate({ title: t, body: body.trim() });
    setTitle('');
    setBody('');
    setOpen(false);
  };

  return (
    <section className="glass rounded-[24px] p-4 sm:p-5">
      <header className="mb-4 flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-warn" />
        <h2 className="font-display text-lg font-semibold tracking-tight">Notlar</h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          <Plus className="h-3 w-3" /> ekle
        </button>
      </header>

      {open && (
        <form onSubmit={submit} className="glass-soft mb-4 space-y-2 rounded-[20px] p-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="başlık"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="detay (opsiyonel)"
            rows={2}
            className="w-full bg-transparent text-xs leading-6 text-ink-2 placeholder:text-ink-3 focus:outline-none"
            style={{ resize: 'vertical' }}
          />
          <div className="flex justify-end gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-1.5 text-ink-2 hover:bg-surface"
            >
              iptal
            </button>
            <button
              type="submit"
              className="rounded-full bg-info px-3 py-1.5 font-semibold text-white shadow-[0_16px_28px_-20px_rgba(37,99,235,0.5)] hover:bg-blue-700"
            >
              kaydet
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-1.5">
        {reminders.length === 0 && (
          <li className="rounded-[18px] border border-dashed border-line bg-surface-2 py-4 text-center text-xs text-ink-3">
            Henuz not eklenmedi.
          </li>
        )}
        {reminders.map((r) => (
          <li
            key={r.id}
            className="group glass-soft row-hover relative rounded-[18px] p-3.5"
          >
            <div className="pr-6 text-sm font-medium text-ink">{r.title}</div>
            {r.body && (
              <div className="whitespace-pre-wrap pr-6 text-xs leading-6 text-ink-2">
                {r.body}
              </div>
            )}
            <button
              type="button"
              onClick={() => del.mutate(r.id)}
              className="absolute right-2 top-2 rounded-full p-1.5 text-ink-3 opacity-70 transition hover:bg-surface hover:text-danger group-hover:opacity-100"
              aria-label="sil"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

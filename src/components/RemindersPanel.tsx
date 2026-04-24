import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import {
  useCreateReminder,
  useDeleteReminder,
  useReminders,
} from '../lib/queries';
import { cn } from '../lib/utils';

function relativeMark(createdAt: number): string {
  const days = Math.max(1, Math.round((Date.now() - createdAt) / 86400000));
  return `T+${days}g`;
}

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

  const deleteReminder = (id: number, reminderTitle: string) => {
    if (confirm(`"${reminderTitle}" notu silinsin mi?`)) {
      del.mutate(id);
    }
  };

  const titleId = 'reminder-title';
  const bodyId = 'reminder-body';

  return (
    <section className="paper-panel pt-3">
      <header className="mb-2 flex items-baseline gap-2">
        <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-3">
          Hatırlatıcılar
        </h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex items-center gap-1 border border-line-2 bg-surface px-2.5 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-2 hover:bg-surface-2 hover:text-ink"
          aria-expanded={open}
          aria-controls="reminder-form"
          aria-label="Yeni hatırlatıcı ekle"
        >
          <Plus className="h-3 w-3" aria-hidden="true" /> ekle
        </button>
      </header>

      {open && (
        <form id="reminder-form" onSubmit={submit} className="mb-3 space-y-2 border border-line bg-surface/60 p-3">
          <label htmlFor={titleId} className="sr-only">
            Hatırlatıcı başlığı
          </label>
          <input
            id={titleId}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="başlık"
            className="w-full bg-transparent font-sans text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
          <label htmlFor={bodyId} className="sr-only">
            Hatırlatıcı detayı
          </label>
          <textarea
            id={bodyId}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="detay (opsiyonel)"
            rows={2}
            className="w-full bg-transparent font-sans text-xs leading-6 text-ink-2 placeholder:text-ink-3 focus:outline-none"
            style={{ resize: 'vertical' }}
          />
          <div className="flex justify-end gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-ink-2 hover:bg-surface"
              aria-label="Hatırlatıcı eklemeyi iptal et"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={create.isPending || title.trim().length === 0}
              className="bg-accent px-3 py-1.5 font-sans font-semibold text-bg hover:bg-accent-2 disabled:opacity-40 disabled:hover:bg-accent"
              aria-label="Hatırlatıcıyı kaydet"
            >
              Hatırlatıcıyı kaydet
            </button>
          </div>
        </form>
      )}

      <ul className="border-t border-ink">
        {reminders.length === 0 && (
          <li className="py-4 text-center font-sans text-xs text-ink-3">
            Henüz not eklenmedi.
          </li>
        )}
        {reminders.map((r, idx) => (
          <li
            key={r.id}
            className={cn(
              'group row-hover relative py-3 pr-8',
              idx !== reminders.length - 1 && 'border-b border-line',
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="paper-headline font-display text-[14px] leading-snug text-ink">
                {r.title}
              </div>
              <div className="font-mono text-[10px] tabular-nums text-accent">
                {relativeMark(r.created_at)}
              </div>
            </div>
            {r.body && (
              <div className="mt-1 whitespace-pre-wrap pr-6 font-sans text-[11px] leading-6 text-ink-2">
                {r.body}
              </div>
            )}
            <button
              type="button"
              onClick={() => deleteReminder(r.id, r.title)}
              disabled={del.isPending}
              className="tap-target absolute right-0 top-2 rounded-sm p-1.5 text-ink-3 opacity-70 transition hover:bg-surface hover:text-danger disabled:opacity-35 group-hover:opacity-100"
              aria-label={`${r.title} hatırlatıcısını sil`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

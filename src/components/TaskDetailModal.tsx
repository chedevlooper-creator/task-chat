import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Trash2, Paperclip, Download } from 'lucide-react';
import type { DayKey, Member, Priority, Status, Task } from '../lib/types';
import {
  DAY_KEYS,
  DAY_LABELS,
  PRIORITY_LABEL,
  STATUS_LABEL,
} from '../lib/types';
import {
  useDeleteAttachment,
  useDeleteTask,
  useUpdateTask,
  useUploadAttachments,
} from '../lib/queries';
import { cn } from '../lib/utils';
import { Avatar } from './Avatar';

export function TaskDetailModal({
  task,
  members,
  onClose,
}: {
  task: Task;
  members: Member[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [day, setDay] = useState<DayKey | null>(task.day);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<Status>(task.status);
  const [assignees, setAssignees] = useState<number[]>(task.assignee_ids);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const update = useUpdateTask();
  const del = useDeleteTask();
  const upload = useUploadAttachments();
  const delAtt = useDeleteAttachment();
  const dialogTitleId = `task-dialog-title-${task.id}`;
  const dialogDescriptionId = `task-dialog-description-${task.id}`;
  const titleInputId = `task-title-${task.id}`;
  const daySelectId = `task-day-${task.id}`;
  const notesId = `task-notes-${task.id}`;
  const fileInputId = `task-files-${task.id}`;

  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes);
    setDay(task.day);
    setPriority(task.priority);
    setStatus(task.status);
    setAssignees(task.assignee_ids);
    titleInputRef.current?.focus();
  }, [task]);

  const sortedAssignees = [...assignees].sort((a, b) => a - b);
  const initialSortedAssignees = [...task.assignee_ids].sort((a, b) => a - b);
  const isDirty =
    title !== task.title ||
    notes !== task.notes ||
    day !== task.day ||
    priority !== task.priority ||
    status !== task.status ||
    JSON.stringify(sortedAssignees) !== JSON.stringify(initialSortedAssignees);

  const save = () => {
    update.mutate({
      id: task.id,
      patch: { title, notes, day, priority, status, assignee_ids: assignees },
    });
  };

  const saveAndClose = () => {
    save();
    onClose();
  };

  const closeWithGuard = useCallback(() => {
    if (!isDirty || confirm('Kaydedilmemiş değişiklikler kapatılacak. Devam edilsin mi?')) {
      onClose();
    }
  }, [isDirty, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeWithGuard();
        return;
      }

      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('hidden') && el.offsetParent !== null);

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeWithGuard]);

  const deleteAttachment = (id: number, filename: string) => {
    if (confirm(`"${filename}" eki silinsin mi?`)) {
      delAtt.mutate(id);
    }
  };

  const toggleAssignee = (id: number) =>
    setAssignees((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    upload.mutate({ taskId: task.id, files: Array.from(files) });
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center animate-fadeUp sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeWithGuard()}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" aria-hidden="true" />
      <div
        ref={dialogRef}
        className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden border-2 border-ink bg-[color:var(--paper-strong)] pb-safe shadow-modal sm:max-h-[90vh] sm:max-w-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
      >
        <header className="grid grid-cols-[1fr_auto] items-start gap-3 border-b border-line-2 px-5 py-4">
          <h2 id={dialogTitleId} className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            Task File · #{task.id}
          </h2>
          <p id={dialogDescriptionId} className="sr-only">
            Görev başlığını, gününü, önceliğini, durumunu, atananlarını, notlarını ve eklerini düzenle.
          </p>
          <button
            type="button"
            onClick={closeWithGuard}
            className="tap-target -m-1 grid place-items-center rounded-sm p-1.5 text-ink-2 hover:bg-surface-2 hover:text-ink"
            aria-label="Görev düzenleme panelini kapat"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <label htmlFor={titleInputId} className="sr-only">
            Görev başlığı
          </label>
          <input
            id={titleInputId}
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="paper-headline w-full border-b border-line bg-transparent pb-2 font-display text-3xl text-ink placeholder:text-ink-3 focus:outline-none"
            placeholder="başlık"
          />

          {/* meta */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Gün" htmlFor={daySelectId}>
              <select
                id={daySelectId}
                value={day ?? ''}
                onChange={(e) => setDay((e.target.value || null) as DayKey | null)}
                className="w-full border border-line-2 bg-surface/80 px-3 py-2.5 text-sm text-ink focus:border-accent/60 focus:ring-0"
              >
                <option value="">Bekleyenler</option>
                {DAY_KEYS.map((d) => (
                  <option key={d} value={d}>
                    {DAY_LABELS[d]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Öncelik">
              <div className="flex gap-1 border border-line bg-surface/60 p-1">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1 px-2 py-2 text-xs font-semibold transition',
                      priority === p
                        ? p === 'high'
                          ? 'bg-danger/10 text-danger ring-1 ring-danger/20'
                          : p === 'medium'
                            ? 'bg-warn/10 text-warn ring-1 ring-warn/20'
                            : 'bg-ink text-bg'
                        : 'text-ink-2 hover:bg-surface hover:text-ink',
                    )}
                    aria-pressed={priority === p}
                  >
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
              </div>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Durum">
                <div className="grid grid-cols-1 gap-1 border border-line bg-surface/60 p-1 min-[420px]:grid-cols-3">
                  {(['pending', 'in_progress', 'done'] as Status[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        'min-h-10 px-2.5 py-2 text-center text-[11px] font-semibold leading-4 transition',
                        status === s
                          ? s === 'done'
                            ? 'bg-accent/10 text-accent ring-1 ring-accent/20'
                            : s === 'in_progress'
                              ? 'bg-info/10 text-info ring-1 ring-info/20'
                               : 'bg-ink text-bg'
                          : 'text-ink-2 hover:bg-surface hover:text-ink',
                      )}
                      aria-pressed={status === s}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          <Field label="Atananlar">
            {members.length === 0 ? (
              <div className="text-xs text-ink-3">takım panelinden üye ekle</div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {members.map((m) => {
                  const on = assignees.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleAssignee(m.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs transition',
                        on
                          ? 'border-accent/30 bg-accent-d text-accent'
                          : 'border-line bg-surface text-ink-2 hover:text-ink',
                      )}
                      aria-pressed={on}
                      aria-label={`${m.name} atamasını ${on ? 'kaldır' : 'ekle'}`}
                    >
                      <Avatar member={m} size={16} />
                      {m.name}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          <Field label="Notlar" htmlFor={notesId}>
            <textarea
              id={notesId}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="notlar, bağlam, kararlar…"
              className="w-full border border-line-2 bg-surface/80 p-3 text-sm leading-7 text-ink focus:border-accent/60 focus:ring-0"
              style={{ resize: 'vertical' }}
            />
          </Field>

          <Field label={`Ekler (${task.attachments.length})`}>
            <div className="space-y-1.5">
              {task.attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 border-b border-line px-1 py-2"
                >
                  <Paperclip className="h-3.5 w-3.5 text-ink-2" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-xs text-ink">{a.filename}</span>
                  <span className="text-[10px] tabular-nums text-ink-3">
                    {Math.round(a.size / 1024)} KB
                  </span>
                  <a
                    href={`/api/attachments/${a.id}`}
                    className="rounded-sm p-1.5 text-ink-2 hover:bg-surface hover:text-ink"
                    aria-label={`${a.filename} ekini indir`}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteAttachment(a.id, a.filename)}
                    className="rounded-sm p-1.5 text-ink-2 hover:bg-surface hover:text-danger"
                    aria-label={`${a.filename} ekini sil`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={upload.isPending}
                aria-busy={upload.isPending}
                aria-label="Göreve dosya yükle"
                className="inline-flex w-full items-center justify-center gap-1.5 border border-dashed border-line-2 bg-surface/40 px-3 py-3 text-xs font-semibold text-ink-2 transition hover:border-accent/60 hover:bg-accent-d hover:text-accent"
              >
                <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                {upload.isPending ? 'yükleniyor…' : 'dosya yükle (max 10MB)'}
              </button>
              <label htmlFor={fileInputId} className="sr-only">
                Ek dosyaları seç
              </label>
              <input
                id={fileInputId}
                ref={fileInput}
                type="file"
                multiple
                hidden
                onChange={(e) => onFiles(e.target.files)}
              />
            </div>
          </Field>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line-2 bg-surface/55 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              if (confirm(`"${task.title}" görevi silinsin mi?`)) {
                del.mutate(task.id);
                onClose();
              }
            }}
            className="tap-target inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-ink-2 transition hover:bg-danger/10 hover:text-danger"
            aria-label={`${task.title} görevini sil`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Sil
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeWithGuard}
              className="px-3 py-1.5 text-xs text-ink-2 hover:bg-surface-2"
              aria-label={`${task.title} görevindeki düzenlemeyi kapat`}
            >
              Kapat
            </button>
            <button
              type="button"
              onClick={saveAndClose}
              disabled={!isDirty}
              className="min-h-10 bg-accent px-4 py-1.5 text-xs font-semibold text-bg transition hover:bg-accent-2 disabled:opacity-45 disabled:hover:bg-accent"
              aria-label={`${task.title} görevindeki değişiklikleri kaydet`}
            >
              Kaydet
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const labelClass = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-2';

  return (
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
        </label>
      ) : (
        <div className={labelClass}>{label}</div>
      )}
      {children}
    </div>
  );
}

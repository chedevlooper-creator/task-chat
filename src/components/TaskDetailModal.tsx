import { useEffect, useRef, useState } from 'react';
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
  const fileInput = useRef<HTMLInputElement>(null);

  const update = useUpdateTask();
  const del = useDeleteTask();
  const upload = useUploadAttachments();
  const delAtt = useDeleteAttachment();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes);
    setDay(task.day);
    setPriority(task.priority);
    setStatus(task.status);
    setAssignees(task.assignee_ids);
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

  const closeWithGuard = () => {
    if (!isDirty || confirm('Kaydedilmemis degisiklikler kapatilacak. Devam edilsin mi?')) {
      onClose();
    }
  };

  const toggleAssignee = (id: number) =>
    setAssignees((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    upload.mutate({ taskId: task.id, files: Array.from(files) });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center animate-fadeUp sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && closeWithGuard()}
    >
      <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[3px]" />
      <div className="glass-strong relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] pb-safe shadow-modal sm:max-h-[90vh] sm:max-w-xl sm:rounded-[28px]">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-3">
            Gorev #{task.id}
          </div>
          <button
            type="button"
            onClick={closeWithGuard}
            className="tap-target grid place-items-center rounded-full p-1.5 text-ink-2 hover:bg-surface-2 hover:text-ink"
            aria-label="kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-display text-2xl font-semibold text-ink placeholder:text-ink-3 focus:outline-none"
            placeholder="başlık"
          />

          {/* meta */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Gün">
              <select
                value={day ?? ''}
                onChange={(e) => setDay((e.target.value || null) as DayKey | null)}
                className="w-full rounded-[16px] border border-line bg-surface px-3 py-2.5 text-sm focus:border-info/30 focus:ring-0"
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
              <div className="glass-soft flex gap-1 rounded-[16px] p-1">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1 rounded-full px-2 py-2 text-xs font-medium transition',
                      priority === p
                        ? p === 'high'
                          ? 'bg-danger/10 text-danger ring-1 ring-danger/20'
                          : p === 'medium'
                            ? 'bg-warn/10 text-warn ring-1 ring-warn/20'
                            : 'bg-surface text-ink ring-1 ring-line'
                        : 'text-ink-2 hover:bg-surface hover:text-ink',
                    )}
                  >
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Durum">
              <div className="glass-soft flex gap-1 rounded-[16px] p-1">
                {(['pending', 'in_progress', 'done'] as Status[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      'flex-1 rounded-full px-2 py-2 text-xs font-medium transition',
                      status === s
                        ? s === 'done'
                          ? 'bg-accent/10 text-accent ring-1 ring-accent/20'
                          : s === 'in_progress'
                            ? 'bg-info/10 text-info ring-1 ring-info/20'
                            : 'bg-surface text-ink ring-1 ring-line'
                        : 'text-ink-2 hover:bg-surface hover:text-ink',
                    )}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </Field>
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
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs ring-1 transition',
                        on
                          ? 'bg-info/10 text-info ring-info/20'
                          : 'bg-surface text-ink-2 ring-line hover:text-ink',
                      )}
                    >
                      <Avatar member={m} size={16} />
                      {m.name}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          <Field label="Notlar">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="notlar, bağlam, kararlar…"
              className="w-full rounded-[16px] border border-line bg-surface p-3 text-sm leading-7 focus:border-info/30 focus:ring-0"
              style={{ resize: 'vertical' }}
            />
          </Field>

          <Field label={`Ekler (${task.attachments.length})`}>
            <div className="space-y-1.5">
              {task.attachments.map((a) => (
                <div
                  key={a.id}
                  className="glass-soft flex items-center gap-2 rounded-[18px] px-3 py-2"
                >
                  <Paperclip className="h-3.5 w-3.5 text-ink-2" />
                  <span className="min-w-0 flex-1 truncate text-xs text-ink">{a.filename}</span>
                  <span className="text-[10px] tabular-nums text-ink-3">
                    {Math.round(a.size / 1024)} KB
                  </span>
                  <a
                    href={`/api/attachments/${a.id}`}
                    className="rounded-full p-1.5 text-ink-2 hover:bg-surface hover:text-ink"
                    aria-label="indir"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => delAtt.mutate(a.id)}
                    className="rounded-full p-1.5 text-ink-2 hover:bg-surface hover:text-danger"
                    aria-label="sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-[18px] border border-dashed border-line px-3 py-3 text-xs text-ink-2 transition hover:border-info/40 hover:text-info"
              >
                <Paperclip className="h-3.5 w-3.5" />
                {upload.isPending ? 'yükleniyor…' : 'dosya yükle (max 10MB)'}
              </button>
              <input
                ref={fileInput}
                type="file"
                multiple
                hidden
                onChange={(e) => onFiles(e.target.files)}
              />
            </div>
          </Field>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={() => {
              if (confirm('Bu görev silinsin mi?')) {
                del.mutate(task.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-ink-2 transition hover:bg-rose-50 hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" /> sil
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeWithGuard}
              className="rounded-full px-3 py-1.5 text-xs text-ink-2 hover:bg-surface-2"
            >
              kapat
            </button>
            <button
              type="button"
              onClick={saveAndClose}
              disabled={!isDirty}
              className="rounded-full bg-info px-4 py-1.5 text-xs font-semibold text-white shadow-[0_18px_34px_-24px_rgba(37,99,235,0.55)] transition hover:bg-blue-700 disabled:opacity-45 disabled:hover:bg-info"
            >
              kaydet
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-2">
        {label}
      </div>
      {children}
    </div>
  );
}

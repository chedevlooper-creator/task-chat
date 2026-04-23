import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { useMessages, useSendMessage } from '../lib/queries';
import { cn, formatTime } from '../lib/utils';

// Clean up messages that were stored as raw openclaw JSON/NDJSON.
function cleanMessageText(raw: string): string {
  if (!raw) return '';
  const s = raw.trim();
  if (!s.startsWith('{') && !s.includes('"finalAssistant')) return s;
  const pick = (o: any): string =>
    (o && (o.finalAssistantText || o.finalAssistantRawText || o.text || o.reply || o.message || o.output || o.content)) || '';
  try {
    const p = pick(JSON.parse(s));
    if (p) return String(p);
  } catch { /* try ndjson */ }
  let best = '';
  for (const line of s.split(/\r?\n/)) {
    try {
      const p = pick(JSON.parse(line));
      if (p && String(p).length > best.length) best = String(p);
    } catch { /* skip */ }
  }
  // extract "finalAssistantRawText":"..." as last-ditch regex
  if (!best) {
    const m = s.match(/"finalAssistant(?:RawText|Text)"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (m) {
      try { best = JSON.parse(`"${m[1]}"`); } catch { best = m[1]; }
    }
  }
  return best || s;
}

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const { data: messages = [] } = useMessages();
  const send = useSendMessage();
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, send.isPending]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    send.mutate(t);
    setText('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'no-print fixed bottom-20 right-4 z-40 inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-xs font-semibold text-ink shadow-pop transition hover:bg-surface-2 active:scale-[0.98] tap-target lg:bottom-5',
        )}
        aria-label={open ? 'chat kapat' : 'chat aç'}
      >
        {open ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
        {open ? 'kapat' : 'chat'}
      </button>

      {open && (
        <div
          className="no-print fixed inset-x-0 bottom-0 z-40 animate-slideInRight sm:bottom-24 sm:right-5 sm:inset-x-auto sm:w-[400px]"
          role="dialog"
          aria-label="openclaw chat"
        >
          <div className="glass-strong flex h-[min(82vh,640px)] flex-col overflow-hidden rounded-t-[24px] pb-safe shadow-modal sm:h-[min(70vh,600px)] sm:rounded-[24px]">
            <header className="flex items-center gap-2 border-b border-line px-4 py-4">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-info/10 ring-1 ring-info/20">
                <MessageSquare className="h-3.5 w-3.5 text-info" />
              </div>
              <div>
                <div className="font-display text-base font-semibold text-ink">OpenClaw</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
                  session: task-chat-web
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto rounded-full p-1.5 text-ink-2 hover:bg-surface-2 hover:text-ink"
                aria-label="kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={streamRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
              {messages.length === 0 && (
                <div className="glass-soft rounded-[18px] p-3 text-xs leading-6 text-ink-2">
                  openclaw hazir. <code className="text-ink">/add</code>,{' '}
                  <code className="text-ink">/done</code>,{' '}
                  <code className="text-ink">/tasks</code> dene veya dogal dilde yaz.
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex flex-col',
                    m.role === 'user' ? 'items-end' : 'items-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[88%] whitespace-pre-wrap rounded-[18px] px-3 py-2.5 text-[13px] leading-relaxed',
                      m.role === 'user'
                        ? 'bg-info/10 text-ink ring-1 ring-info/10'
                        : m.role === 'system'
                          ? 'bg-surface-3 text-ink-2 ring-1 ring-line'
                          : 'glass-soft text-ink',
                    )}
                  >
                    {m.role === 'assistant' ? cleanMessageText(m.text) : m.text}
                  </div>
                  <div className="mt-1 text-[10px] text-ink-3">{formatTime(m.created_at)}</div>
                </div>
              ))}
              {send.isPending && (
                <div className="flex items-start">
                  <div className="glass-soft inline-flex items-center gap-1.5 rounded-[18px] px-3 py-2 text-[13px]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-info" />
                    openclaw calisiyor...
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={submit}
              className="flex items-end gap-2 border-t border-line p-3"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit(e as unknown as React.FormEvent);
                  }
                }}
                rows={1}
                placeholder="mesaj ya da /komut…"
                className="min-h-[46px] flex-1 rounded-[18px] border border-line bg-surface px-3 py-3 text-sm text-ink placeholder:text-ink-3 focus:border-info/30 focus:ring-0"
                style={{ resize: 'none' }}
              />
              <button
                type="submit"
                disabled={send.isPending || text.trim().length === 0}
                className="tap-target grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-info text-white shadow-pop transition hover:bg-blue-700 disabled:opacity-40"
                aria-label="gönder"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

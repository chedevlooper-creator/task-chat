import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { useMessages, useOpenclawStatus, useSendMessage } from '../lib/queries';
import { cn, formatTime } from '../lib/utils';

// Clean up messages that were stored as raw openclaw JSON/NDJSON.
function cleanMessageText(raw: string): string {
  if (!raw) return '';
  const s = raw.trim();
  if (/openclaw hata|spawn openclaw|enoent/i.test(s)) {
    return 'OpenClaw bu ortamda hazır değil. Gateway/CLI kurulumu tamamlanınca bu panelden sohbet edebilirsin.';
  }
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
  const openclawStatus = useOpenclawStatus();
  const { data: messages = [] } = useMessages();
  const send = useSendMessage();
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, send.isPending]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    send.mutate(t);
    setText('');
  };

  const status = openclawStatus.data;
  const shouldShowSetupGuide =
    (status && !status.enabled) || openclawStatus.isError || send.isError || send.data?.code === -1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'no-print fixed bottom-20 right-4 z-40 inline-flex h-11 items-center gap-2 border-2 border-ink bg-[color:var(--paper-strong)] px-4 text-xs font-bold uppercase tracking-[0.12em] text-ink shadow-pop transition hover:bg-surface-2 active:scale-[0.98] tap-target lg:bottom-5',
        )}
        aria-label={open ? 'chat kapat' : 'chat aç'}
      >
        {open ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
        {open ? 'kapat' : 'chat'}
      </button>

      {open && (
        <div
          className="no-print fixed inset-x-0 bottom-0 z-40 animate-slideInRight sm:bottom-24 sm:right-5 sm:inset-x-auto sm:w-[380px] lg:w-[420px]"
          role="dialog"
          aria-label="OpenClaw chat"
        >
          <div className="flex h-[min(82vh,640px)] flex-col overflow-hidden border-2 border-ink bg-[color:var(--paper-strong)] pb-safe shadow-modal sm:h-[min(70vh,600px)]">
            <header className="flex items-center gap-2 border-b border-line-2 px-4 py-4">
              <div className="grid h-8 w-8 place-items-center border border-line bg-surface-2">
                <MessageSquare className="h-3.5 w-3.5 text-info" />
              </div>
              <div>
                <div className="font-display text-base font-semibold text-ink">OpenClaw</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
                  Oturum: task-chat-web
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto rounded-sm p-1.5 text-ink-2 hover:bg-surface-2 hover:text-ink"
                aria-label="kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={streamRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
              {shouldShowSetupGuide && (
                <div className="border border-line bg-surface/70 p-3 text-xs leading-6 text-ink-2">
                  <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-2">
                    Nasıl kurulur?
                  </div>
                  <div className="space-y-1">
                    <div>
                      1) OpenClaw Gateway’i çalıştır (varsayılan: <code className="text-ink">127.0.0.1:18789</code>).
                    </div>
                    <div>
                      2) Uygulamayı başlatmadan önce şu env’leri ayarla:{' '}
                      <code className="text-ink">TASK_CHAT_ENABLE_OPENCLAW_AGENT=1</code> ve{' '}
                      <code className="text-ink">OPENCLAW_GATEWAY_TOKEN=...</code>
                    </div>
                    <div>
                      3) OpenClaw config’te şu değerler açık olmalı:{' '}
                      <code className="text-ink">gateway.http.endpoints.chatCompletions.enabled=true</code> ve{' '}
                      <code className="text-ink">gateway.auth.mode="token"</code>
                    </div>
                    <div>
                      4) Smoke test:{' '}
                      <code className="text-ink">
                        curl http://127.0.0.1:18789/v1/models -H "Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN"
                      </code>
                    </div>
                    <div>5) Değişikliklerden sonra uygulamayı yeniden başlat.</div>
                  </div>
                  {status && (
                    <div className="mt-2 font-mono text-[10px] text-ink-3">
                      Durum: {status.enabled ? 'etkin' : 'kapalı'} · Gateway: {status.gateway_url} · Agent: {status.agent}
                      {status.missing.length > 0 ? ` · Eksik: ${status.missing.join(', ')}` : ''}
                    </div>
                  )}
                </div>
              )}
              {messages.length === 0 && (
                <div className="border border-line bg-surface/70 p-3 text-xs leading-6 text-ink-2">
                  Lokal komutlar hazır. <code className="text-ink">/add</code>,{' '}
                  <code className="text-ink">/done</code>,{' '}
                  <code className="text-ink">/tasks</code> dene. Doğal dil için OpenClaw agent onayı gerekir.
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
                      'max-w-[88%] whitespace-pre-wrap border px-3 py-2.5 text-[13px] leading-relaxed',
                      m.role === 'user'
                        ? 'border-accent/20 bg-accent-d text-ink'
                        : m.role === 'system'
                          ? 'border-line bg-surface-3 text-ink-2'
                          : 'border-line bg-surface text-ink',
                    )}
                  >
                    {m.role === 'user' ? m.text : cleanMessageText(m.text)}
                  </div>
                  <div className="mt-1 text-[10px] text-ink-3">{formatTime(m.created_at)}</div>
                </div>
              ))}
              {send.isPending && (
                <div className="flex items-start">
                  <div className="inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-2 text-[13px]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    OpenClaw çalışıyor...
                  </div>
                </div>
              )}
              {send.isError && (
                <div className="border border-danger/25 bg-danger/10 px-3 py-2 text-xs leading-6 text-danger" role="alert">
                  Mesaj gönderilemedi. Bağlantıyı veya OpenClaw kurulumunu kontrol edip tekrar dene.
                </div>
              )}
            </div>

            <form
              onSubmit={submit}
              className="flex items-end gap-2 border-t border-line-2 p-3"
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
                placeholder="Mesaj ya da /komut…"
                className="min-h-[46px] flex-1 border border-line-2 bg-surface px-3 py-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent/60 focus:ring-0"
                style={{ resize: 'none' }}
              />
              <button
                type="submit"
                disabled={send.isPending || text.trim().length === 0}
                className="tap-target grid h-11 w-11 shrink-0 place-items-center bg-accent text-bg shadow-pop transition hover:bg-accent-2 disabled:opacity-40"
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

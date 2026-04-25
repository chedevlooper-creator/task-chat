// HTTP bridge to OpenClaw Gateway's OpenAI-compatible /v1/chat/completions endpoint.
// Replaces the previous spawn-based CLI integration. The OpenClaw Gateway must be
// running locally with `gateway.http.endpoints.chatCompletions.enabled=true` and
// `gateway.auth.mode="token"` (or "password"). See:
//   https://docs.openclaw.ai/gateway/openai-http-api.md

const DEFAULT_GATEWAY_URL = 'http://127.0.0.1:18789';
const DEFAULT_AGENT = 'openclaw/default';
const DEFAULT_TIMEOUT_MS = 60_000;

export function isOpenclawAgentEnabled(env = process.env) {
  const flag = String(env.TASK_CHAT_ENABLE_OPENCLAW_AGENT || '').toLowerCase();
  if (flag !== '1' && flag !== 'true') return false;
  // Token is required for shared-secret auth (the only mode we support here).
  return Boolean(env.OPENCLAW_GATEWAY_TOKEN);
}

export function openclawDisabledReply() {
  return 'OpenClaw agent bu oturumda etkin değil. Lokal komutlar çalışır: /add görev, /done 1, /tasks. Doğal dil için TASK_CHAT_ENABLE_OPENCLAW_AGENT=1 ve OPENCLAW_GATEWAY_TOKEN ayarlanmalı; ardından OpenClaw config içinde gateway.http.endpoints.chatCompletions.enabled=true olmalı.';
}

export function getOpenclawStatus(env = process.env) {
  const flag = String(env.TASK_CHAT_ENABLE_OPENCLAW_AGENT || '').toLowerCase();
  const flagEnabled = flag === '1' || flag === 'true';
  const tokenPresent = Boolean(env.OPENCLAW_GATEWAY_TOKEN);

  const missing = [];
  if (!flagEnabled) missing.push('TASK_CHAT_ENABLE_OPENCLAW_AGENT');
  if (!tokenPresent) missing.push('OPENCLAW_GATEWAY_TOKEN');

  const gateway_url = String(env.OPENCLAW_GATEWAY_URL || DEFAULT_GATEWAY_URL).replace(/\/+$/, '');
  const agent = String(env.OPENCLAW_AGENT || DEFAULT_AGENT);

  return {
    enabled: flagEnabled && tokenPresent,
    missing,
    gateway_url,
    agent,
  };
}

function pickReplyText(json) {
  const choice = json?.choices?.[0];
  const msg = choice?.message;
  if (typeof msg?.content === 'string' && msg.content.trim()) return msg.content.trim();
  // OpenAI-style array content
  if (Array.isArray(msg?.content)) {
    const text = msg.content
      .map((part) => (typeof part === 'string' ? part : part?.text || ''))
      .join('')
      .trim();
    if (text) return text;
  }
  if (typeof choice?.text === 'string' && choice.text.trim()) return choice.text.trim();
  return '';
}

function classifyHttpFailure(status, bodyText) {
  const text = String(bodyText || '').toLowerCase();
  if (status === 401 || status === 403) {
    return 'OpenClaw gateway token kabul etmedi. OPENCLAW_GATEWAY_TOKEN değerini kontrol et.';
  }
  if (status === 404) {
    return 'OpenClaw /v1/chat/completions endpoint bulunamadı. Config: gateway.http.endpoints.chatCompletions.enabled=true olmalı.';
  }
  if (status === 429) {
    return 'OpenClaw gateway hız sınırına takıldı. Birazdan tekrar dene.';
  }
  if (text.includes('scope upgrade pending approval') || text.includes('pairing required')) {
    return 'OpenClaw gateway ek izin/onay bekliyor. OpenClaw panelinden scope onayını tamamladıktan sonra tekrar dene.';
  }
  return `OpenClaw hata (HTTP ${status}): ${String(bodyText || '').slice(0, 500) || 'boş yanıt'}`;
}

/**
 * Send a single chat turn to OpenClaw Gateway.
 *
 * @param {string} message     User text.
 * @param {string} sessionKey  Stable session id (sent as OpenAI `user`).
 * @param {object} [opts]
 * @param {object} [opts.env]
 * @param {typeof fetch} [opts.fetchImpl]
 * @param {number} [opts.timeoutMs]
 * @returns {Promise<{ ok: true, reply: string } | { ok: false, reply: string }>}
 */
export async function callOpenclawChat(message, sessionKey, opts = {}) {
  const env = opts.env || process.env;
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  const timeoutMs = Number(opts.timeoutMs ?? env.OPENCLAW_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

  if (typeof fetchImpl !== 'function') {
    return { ok: false, reply: 'OpenClaw bridge: fetch API yok (Node 18+ gerekli).' };
  }

  const baseUrl = String(env.OPENCLAW_GATEWAY_URL || DEFAULT_GATEWAY_URL).replace(/\/+$/, '');
  const token = env.OPENCLAW_GATEWAY_TOKEN;
  const agent = env.OPENCLAW_AGENT || DEFAULT_AGENT;
  if (!token) {
    return { ok: false, reply: 'OPENCLAW_GATEWAY_TOKEN ayarlı değil.' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'x-openclaw-session-key': sessionKey,
  };
  if (env.OPENCLAW_BACKEND_MODEL) {
    headers['x-openclaw-model'] = env.OPENCLAW_BACKEND_MODEL;
  }

  const body = JSON.stringify({
    model: agent,
    user: sessionKey,
    stream: false,
    messages: [{ role: 'user', content: message }],
  });

  try {
    const res = await fetchImpl(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, reply: classifyHttpFailure(res.status, text) };
    }

    const json = await res.json().catch(() => null);
    const reply = pickReplyText(json);
    if (!reply) {
      return {
        ok: false,
        reply: 'OpenClaw yanıt üretmedi. Tekrar dene veya /add, /done, /tasks komutlarından birini kullan.',
      };
    }
    return { ok: true, reply };
  } catch (err) {
    if (err && err.name === 'AbortError') {
      return { ok: false, reply: 'OpenClaw yanıtı zaman aşımına uğradı. Birazdan tekrar dene.' };
    }
    const msg = err && err.message ? err.message : String(err);
    if (/ECONNREFUSED|fetch failed/i.test(msg)) {
      return {
        ok: false,
        reply: 'OpenClaw gateway erişilemedi. Gateway çalışıyor mu? (varsayılan 127.0.0.1:18789)',
      };
    }
    return { ok: false, reply: `OpenClaw bridge hatası: ${msg}` };
  } finally {
    clearTimeout(timer);
  }
}

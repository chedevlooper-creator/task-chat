import { describe, expect, it, vi } from 'vitest';
import {
  callOpenclawChat,
  getOpenclawStatus,
  isOpenclawAgentEnabled,
  openclawDisabledReply,
} from '../../server/openclawBridge';

const baseEnv = {
  OPENCLAW_GATEWAY_TOKEN: 'test-token',
  OPENCLAW_GATEWAY_URL: 'http://127.0.0.1:18789',
};

function mockFetch(impl: (url: string, init: RequestInit) => Promise<Response> | Response) {
  return vi.fn(impl as any);
}

describe('isOpenclawAgentEnabled', () => {
  it('requires the feature flag and a gateway token', () => {
    expect(isOpenclawAgentEnabled({})).toBe(false);
    expect(isOpenclawAgentEnabled({ TASK_CHAT_ENABLE_OPENCLAW_AGENT: '1' })).toBe(false);
    expect(
      isOpenclawAgentEnabled({ TASK_CHAT_ENABLE_OPENCLAW_AGENT: '1', OPENCLAW_GATEWAY_TOKEN: 'x' }),
    ).toBe(true);
    expect(
      isOpenclawAgentEnabled({ TASK_CHAT_ENABLE_OPENCLAW_AGENT: 'true', OPENCLAW_GATEWAY_TOKEN: 'x' }),
    ).toBe(true);
  });
});

describe('openclawDisabledReply', () => {
  it('explains both flags users need to set', () => {
    const reply = openclawDisabledReply();
    expect(reply).toMatch(/TASK_CHAT_ENABLE_OPENCLAW_AGENT/);
    expect(reply).toMatch(/OPENCLAW_GATEWAY_TOKEN/);
  });
});

describe('getOpenclawStatus', () => {
  it('reports enabled/missing/gateway_url/agent without leaking the token', () => {
    const status = getOpenclawStatus({
      TASK_CHAT_ENABLE_OPENCLAW_AGENT: '1',
      OPENCLAW_GATEWAY_TOKEN: 'super-secret',
      OPENCLAW_GATEWAY_URL: 'http://127.0.0.1:18789/',
      OPENCLAW_AGENT: 'openclaw/default',
    });
    expect(status).toEqual({
      enabled: true,
      missing: [],
      gateway_url: 'http://127.0.0.1:18789',
      agent: 'openclaw/default',
    });
    expect(JSON.stringify(status)).not.toMatch(/super-secret/);
    expect('OPENCLAW_GATEWAY_TOKEN' in (status as any)).toBe(false);
  });

  it('lists missing flag and/or token', () => {
    expect(getOpenclawStatus({})).toMatchObject({
      enabled: false,
      missing: ['TASK_CHAT_ENABLE_OPENCLAW_AGENT', 'OPENCLAW_GATEWAY_TOKEN'],
    });
    expect(getOpenclawStatus({ TASK_CHAT_ENABLE_OPENCLAW_AGENT: '1' })).toMatchObject({
      enabled: false,
      missing: ['OPENCLAW_GATEWAY_TOKEN'],
    });
  });
});

describe('callOpenclawChat', () => {
  it('posts an OpenAI-compatible chat completion to the configured gateway', async () => {
    const fetchImpl = mockFetch(async (_url, init) => {
      const body = JSON.parse(String(init.body));
      expect(body).toMatchObject({
        model: 'openclaw/default',
        user: 'task-chat-web',
        stream: false,
        messages: [{ role: 'user', content: 'hi' }],
      });
      const headers = init.headers as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer test-token');
      expect(headers['x-openclaw-session-key']).toBe('task-chat-web');
      return new Response(
        JSON.stringify({
          choices: [{ message: { role: 'assistant', content: 'pong 🏓' } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const result = await callOpenclawChat('hi', 'task-chat-web', { env: baseEnv, fetchImpl });
    expect(result).toEqual({ ok: true, reply: 'pong 🏓' });
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://127.0.0.1:18789/v1/chat/completions',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('forwards OPENCLAW_BACKEND_MODEL via x-openclaw-model header', async () => {
    const fetchImpl = mockFetch(async (_url, init) => {
      const headers = init.headers as Record<string, string>;
      expect(headers['x-openclaw-model']).toBe('openai/gpt-5.4');
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
        { status: 200 },
      );
    });

    const env = { ...baseEnv, OPENCLAW_BACKEND_MODEL: 'openai/gpt-5.4' };
    const result = await callOpenclawChat('hi', 'task-chat-web', { env, fetchImpl });
    expect(result.ok).toBe(true);
  });

  it('classifies 401 as a token problem', async () => {
    const fetchImpl = mockFetch(async () => new Response('unauthorized', { status: 401 }));
    const result = await callOpenclawChat('hi', 's', { env: baseEnv, fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.reply).toMatch(/OPENCLAW_GATEWAY_TOKEN/);
  });

  it('classifies 404 as a config problem (endpoint disabled)', async () => {
    const fetchImpl = mockFetch(async () => new Response('not found', { status: 404 }));
    const result = await callOpenclawChat('hi', 's', { env: baseEnv, fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.reply).toMatch(/chatCompletions\.enabled/);
  });

  it('surfaces scope-approval errors from the gateway', async () => {
    const fetchImpl = mockFetch(async () => new Response('scope upgrade pending approval', { status: 500 }));
    const result = await callOpenclawChat('hi', 's', { env: baseEnv, fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.reply).toMatch(/scope onayını tamamladıktan sonra/);
  });

  it('returns a clear fallback when the response has no text', async () => {
    const fetchImpl = mockFetch(async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: '' } }] }), { status: 200 }),
    );
    const result = await callOpenclawChat('hi', 's', { env: baseEnv, fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.reply).toMatch(/yanıt üretmedi/);
  });

  it('refuses to call when the token env var is missing', async () => {
    const fetchImpl = mockFetch(async () => new Response('should not be called', { status: 200 }));
    const result = await callOpenclawChat('hi', 's', { env: {}, fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.reply).toMatch(/OPENCLAW_GATEWAY_TOKEN/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('reports gateway-down errors with a friendly message', async () => {
    const fetchImpl = mockFetch(async () => {
      throw new Error('fetch failed');
    });
    const result = await callOpenclawChat('hi', 's', { env: baseEnv, fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.reply).toMatch(/Gateway çalışıyor mu/);
  });
});

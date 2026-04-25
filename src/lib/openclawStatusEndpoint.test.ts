import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

type StartedServer = {
  baseUrl: string;
  proc: ReturnType<typeof spawn>;
};

async function startServer(env: Record<string, string | undefined>): Promise<StartedServer> {
  const serverPath = fileURLToPath(new URL('../../server.js', import.meta.url));
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'task-chat-'));
  const dbPath = path.join(tmpDir, 'data.db');

  const proc = spawn((globalThis as any).process.execPath, [serverPath], {
    env: {
      ...process.env,
      PORT: '0',
      TASK_CHAT_DB_PATH: dbPath,
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const baseUrl = await new Promise<string>((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      reject(new Error(`server başlatılamadı (timeout)\nstdout:\n${stdout}\nstderr:\n${stderr}`));
    }, 10_000);

    const onData = (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
      const match = stdout.match(/task-chat server on (http:\/\/127\.0\.0\.1:\d+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    };

    proc.stdout?.on('data', onData);
    proc.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    proc.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`server beklenmeden kapandı (code=${code})\nstdout:\n${stdout}\nstderr:\n${stderr}`));
    });
    proc.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });

  return { baseUrl, proc };
}

async function stopServer(proc: ReturnType<typeof spawn>) {
  if (proc.exitCode !== null) return;

  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      try {
        proc.kill('SIGKILL');
      } catch {}
      resolve();
    }, 3_000);

    proc.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });

    try {
      proc.kill();
    } catch {
      clearTimeout(timer);
      resolve();
    }
  });
}

let started: StartedServer | null = null;

afterEach(async () => {
  if (started) await stopServer(started.proc);
  started = null;
});

describe('GET /api/openclaw/status', () => {
  it('enabled/missing/gateway_url/agent alanlarını döndürür ve token sızdırmaz', async () => {
    const token = 'super-secret-token-123';

    started = await startServer({
      TASK_CHAT_ENABLE_OPENCLAW_AGENT: '1',
      OPENCLAW_GATEWAY_TOKEN: token,
      OPENCLAW_GATEWAY_URL: 'http://127.0.0.1:18789/',
      OPENCLAW_AGENT: 'openclaw/default',
    });

    const res = await fetch(`${started.baseUrl}/api/openclaw/status`);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json).toEqual({
      enabled: true,
      missing: [],
      gateway_url: 'http://127.0.0.1:18789',
      agent: 'openclaw/default',
    });

    const raw = JSON.stringify(json);
    expect(raw).not.toMatch(token);
    expect(Object.prototype.hasOwnProperty.call(json, 'OPENCLAW_GATEWAY_TOKEN')).toBe(false);
  });

  it('flag/token eksikse missing listesine ekler', async () => {
    started = await startServer({
      TASK_CHAT_ENABLE_OPENCLAW_AGENT: '',
      OPENCLAW_GATEWAY_TOKEN: '',
    });

    const res = await fetch(`${started.baseUrl}/api/openclaw/status`);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json).toMatchObject({
      enabled: false,
      missing: ['TASK_CHAT_ENABLE_OPENCLAW_AGENT', 'OPENCLAW_GATEWAY_TOKEN'],
    });
  });
});


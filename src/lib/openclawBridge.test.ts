import { describe, expect, it } from 'vitest';
import {
  buildOpenclawReply,
  buildOpenclawCommand,
  formatOpenclawFailure,
  isOpenclawAgentEnabled,
  extractOpenclawReply,
} from '../../server/openclawBridge.js';

describe('formatOpenclawFailure', () => {
  it('turns gateway approval and session lock failures into a short user message', () => {
    const stderr = [
      'GatewayClientRequestError: scope upgrade pending approval',
      'Error: session file locked (timeout 10000ms): pid=21132 task-chat-web.jsonl.lock',
    ].join('\n');

    expect(formatOpenclawFailure(-1, stderr)).toBe(
      'OpenClaw gateway ek izin/onay bekliyor. OpenClaw panelinden scope onayını tamamladıktan sonra tekrar dene.',
    );
  });

  it('reports timeout without exposing process details', () => {
    expect(formatOpenclawFailure(-1, 'timeout (55s)')).toBe(
      'OpenClaw yanıtı zaman aşımına uğradı. Birazdan tekrar dene.',
    );
  });

  it('uses a clear fallback when OpenClaw exits successfully without text', () => {
    expect(buildOpenclawReply({ code: 0, reply: '', stderr: '' })).toBe(
      'OpenClaw yanıt üretmedi. Tekrar dene veya /add, /done, /tasks komutlarından birini kullan.',
    );
  });

  it('keeps OpenClaw agent calls disabled unless explicitly enabled', () => {
    expect(isOpenclawAgentEnabled({ TASK_CHAT_ENABLE_OPENCLAW_AGENT: '1' })).toBe(true);
    expect(isOpenclawAgentEnabled({ TASK_CHAT_ENABLE_OPENCLAW_AGENT: 'true' })).toBe(true);
    expect(isOpenclawAgentEnabled({})).toBe(false);
  });

  it('uses the official OpenClaw launcher by default so device identity is preserved', () => {
    const command = buildOpenclawCommand(
      ['agent', '--json'],
      { APPDATA: 'C:\\Users\\isaha\\AppData\\Roaming' },
      'C:\\Program Files\\nodejs\\node.exe',
      (candidate) => candidate.endsWith('openclaw.mjs'),
    );

    expect(command).toEqual({ command: 'openclaw', args: ['agent', '--json'] });
  });

  it('allows an explicit OpenClaw CLI override', () => {
    const command = buildOpenclawCommand(
      ['agent', '--json'],
      { OPENCLAW_CLI: 'C:\\tools\\openclaw.mjs' },
      'C:\\Program Files\\nodejs\\node.exe',
      (candidate) => candidate.endsWith('openclaw.mjs'),
    );

    expect(command.command).toBe('C:\\Program Files\\nodejs\\node.exe');
    expect(command.args[0]).toBe('C:\\tools\\openclaw.mjs');
    expect(command.args.slice(1)).toEqual(['agent', '--json']);
  });

  it('extracts the final assistant text from noisy OpenClaw CLI output', () => {
    const output = [
      '\u001b[31mgateway connect failed: scope upgrade pending approval\u001b[0m',
      '\u001b[31m{\u001b[0m',
      '  "payloads": [',
      '    { "text": "pong 🏓", "mediaUrl": null }',
      '  ],',
      '  "meta": { "durationMs": 5362 }',
      '}',
    ].join('\n');

    expect(extractOpenclawReply(output)).toBe('pong 🏓');
  });
});

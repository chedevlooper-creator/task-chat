export function isOpenclawAgentEnabled(env?: Record<string, string | undefined>): boolean;

export function openclawDisabledReply(): string;

export function getOpenclawStatus(env?: Record<string, string | undefined>): {
  enabled: boolean;
  missing: string[];
  gateway_url: string;
  agent: string;
};

export function callOpenclawChat(
  message: string,
  sessionKey: string,
  opts?: {
    env?: Record<string, string | undefined>;
    fetchImpl?: any;
    timeoutMs?: number;
  },
): Promise<{ ok: true; reply: string } | { ok: false; reply: string }>;


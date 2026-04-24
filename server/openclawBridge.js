export function buildOpenclawCommand(args, env = process.env, execPath = process.execPath, pathExists = () => false) {
  const configuredCli = env.OPENCLAW_CLI;

  if (configuredCli && pathExists(configuredCli)) {
    return { command: execPath, args: [configuredCli, ...args] };
  }

  // Windows: shims (.ps1/.cmd) are unreliable from spawn().
  // Run the mjs entry point directly via node.exe.
  const isWin = process.platform === 'win32';
  if (isWin) {
    const mjsPath = env.APPDATA
      ? `${env.APPDATA}\\npm\\node_modules\\openclaw\\openclaw.mjs`
      : `${env.USERPROFILE}\\AppData\\Roaming\\npm\\node_modules\\openclaw\\openclaw.mjs`;
    if (pathExists(mjsPath)) return { command: execPath, args: [mjsPath, ...args] };
  }

  return { command: 'openclaw', args };
}

const ANSI_PATTERN = /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g;

function cleanOpenclawOutput(output) {
  return String(output || '').replace(ANSI_PATTERN, '').trim();
}

function pickReply(o) {
  return (
    o?.finalAssistantText ||
    o?.finalAssistantRawText ||
    o?.text ||
    o?.reply ||
    o?.message ||
    o?.output ||
    o?.content ||
    o?.result?.payloads?.[0]?.text ||
    o?.payloads?.[0]?.text ||
    ''
  );
}

export function extractOpenclawReply(output) {
  const raw = cleanOpenclawOutput(output);
  if (!raw) return '';

  try {
    const parsed = JSON.parse(raw);
    const reply = pickReply(parsed);
    if (reply) return String(reply);
  } catch { /* try structured fragments */ }

  const starts = [...raw.matchAll(/{/g)].map((match) => match.index ?? -1).filter((i) => i >= 0);
  for (const start of starts) {
    try {
      const parsed = JSON.parse(raw.slice(start));
      const reply = pickReply(parsed);
      if (reply) return String(reply);
    } catch { /* try next object start */ }
  }

  const lines = raw.split(/\r?\n/).filter(Boolean);
  let best = '';
  for (const line of lines) {
    try {
      const reply = pickReply(JSON.parse(line));
      if (reply && String(reply).length > best.length) best = String(reply);
    } catch { /* skip non-json line */ }
  }
  if (best) return best;

  const tail = lines[lines.length - 1] || raw;
  return tail.length > 2000 ? `${tail.slice(0, 2000)}...` : tail;
}

export function formatOpenclawFailure(code, stderr) {
  const text = String(stderr || '').toLowerCase();

  if (text.includes('scope upgrade pending approval') || text.includes('pairing required')) {
    return 'OpenClaw gateway ek izin/onay bekliyor. OpenClaw panelinden scope onayını tamamladıktan sonra tekrar dene.';
  }

  if (text.includes('session file locked')) {
    return 'OpenClaw oturumu hala önceki isteği bitiriyor. Birazdan tekrar dene.';
  }

  if (text.includes('timeout')) {
    return 'OpenClaw yanıtı zaman aşımına uğradı. Birazdan tekrar dene.';
  }

  return `OpenClaw hata: ${stderr || `kod=${code}`}`;
}

export function buildOpenclawReply({ code, reply, stderr }) {
  const text = String(reply || '').trim();
  if (text) return text;

  if (code === 0) {
    return 'OpenClaw yanıt üretmedi. Tekrar dene veya /add, /done, /tasks komutlarından birini kullan.';
  }

  return formatOpenclawFailure(code, stderr);
}

export function isOpenclawAgentEnabled(env = process.env) {
  const value = String(env.TASK_CHAT_ENABLE_OPENCLAW_AGENT || '').toLowerCase();
  return value === '1' || value === 'true';
}

export function openclawDisabledReply() {
  return 'OpenClaw agent bu oturumda etkin değil. Lokal komutlar çalışır: /add görev, /done 1, /tasks. Doğal dil için TASK_CHAT_ENABLE_OPENCLAW_AGENT=1 ile başlatıp OpenClaw scope onayını tamamla.';
}

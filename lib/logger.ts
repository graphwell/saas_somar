type LogLevel = 'info' | 'warn' | 'error';
type Ctx = Record<string, unknown>;

const BLOCKED = ['token', 'secret', 'password', 'key', 'authorization'];

function sanitize(ctx?: Ctx): Ctx {
  if (!ctx) return {};
  return Object.fromEntries(
    Object.entries(ctx).map(([k, v]) =>
      BLOCKED.some(b => k.toLowerCase().includes(b)) ? [k, '[REDACTED]'] : [k, v]
    )
  );
}

function log(level: LogLevel, msg: string, ctx?: Ctx) {
  const entry = { ts: new Date().toISOString(), level, msg, ...sanitize(ctx) };
  level === 'error'
    ? console.error(JSON.stringify(entry))
    : console.log(JSON.stringify(entry));
}

export const logger = {
  info:  (msg: string, ctx?: Ctx) => log('info',  msg, ctx),
  warn:  (msg: string, ctx?: Ctx) => log('warn',  msg, ctx),
  error: (msg: string, ctx?: Ctx) => log('error', msg, ctx),
};

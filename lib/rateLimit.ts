const store = new Map<string, { count: number; ts: number }>();

export function rateLimit(key: string, maxRequests = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.ts > windowMs) {
    store.set(key, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

// Rate limiting: Upstash Redis when configured (shared across serverless
// instances), otherwise a per-instance in-memory window.

import 'server-only';

const mem = new Map<string, { count: number; reset: number }>();

export async function rateLimit(key: string, max: number, windowSec: number): Promise<{ ok: boolean; retryAfter: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const hashed = await hash(key);

  if (url && token) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url, token });
      const k = `rl:${hashed}`;
      const count = await redis.incr(k);
      if (count === 1) await redis.expire(k, windowSec);
      const ttl = count > max ? await redis.ttl(k) : 0;
      return { ok: count <= max, retryAfter: Math.max(1, ttl) };
    } catch {
      /* fall through to memory */
    }
  }

  const now = Date.now();
  const cur = mem.get(hashed);
  if (!cur || cur.reset < now) {
    mem.set(hashed, { count: 1, reset: now + windowSec * 1000 });
    if (mem.size > 5000) mem.clear();
    return { ok: true, retryAfter: 0 };
  }
  cur.count++;
  return { ok: cur.count <= max, retryAfter: Math.ceil((cur.reset - now) / 1000) };
}

async function hash(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
}

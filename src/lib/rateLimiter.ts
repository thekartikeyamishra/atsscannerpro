// src/lib/rateLimiter.ts
// Distributed sliding-window rate limiting.
//
// WHY THIS FILE WAS REWRITTEN
// The old limiter kept an in-memory Map of IP → timestamps. On Vercel every
// concurrent lambda has its own memory, so the effective limit was
// "8 scans per 10 min PER INSTANCE" — trivially bypassed by a burst of
// parallel requests, each landing on a cold instance. That is the control
// protecting your paid Gemini quota, so it needs to be shared state.
//
// @upstash/ratelimit was already in package.json but never imported. It is
// used here. When Upstash env vars are absent (local dev) this falls back to
// the in-memory behaviour, which is correct for a single dev process.
//
// It also removes the module-scope setInterval() cleanup timer, which kept a
// serverless instance's event loop referenced.

import type { NextRequest } from 'next/server';
import type { RateLimit } from '@/types';

// ── Upstash-backed limiter (lazy) ───────────────────────────────────────────
type Limiter = import('@upstash/ratelimit').Ratelimit;

let limiterPromise: Promise<Limiter | null> | null = null;

function getLimiter(limit: number, windowSeconds: number): Promise<Limiter | null> {
  if (limiterPromise) return limiterPromise;

  limiterPromise = (async () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;

    try {
      const [{ Ratelimit }, { Redis }] = await Promise.all([
        import('@upstash/ratelimit'),
        import('@upstash/redis'),
      ]);

      return new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        prefix: 'ats:rl',
        analytics: false,
      });
    } catch {
      return null;
    }
  })();

  return limiterPromise;
}

// ── In-memory fallback (dev / Upstash outage) ───────────────────────────────
const memStore = new Map<string, number[]>();

function memCheck(key: string, limit: number, windowMs: number): RateLimit {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Opportunistic cleanup: bound the map without a background timer.
  if (memStore.size > 5000) {
    for (const [k, stamps] of memStore) {
      if (!stamps.some((t) => t > cutoff)) memStore.delete(k);
    }
  }

  const history = (memStore.get(key) ?? []).filter((t) => t > cutoff);

  if (history.length >= limit) {
    return { allowed: false, remaining: 0, resetAt: history[0] + windowMs };
  }

  history.push(now);
  memStore.set(key, history);

  return { allowed: true, remaining: limit - history.length, resetAt: now + windowMs };
}

/**
 * Sliding-window rate limit check.
 * @param key      Client identifier (IP address).
 * @param limit    Max requests allowed in the window.
 * @param windowMs Window duration in milliseconds.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimit> {
  const limiter = await getLimiter(limit, Math.round(windowMs / 1000));

  if (limiter) {
    try {
      const { success, remaining, reset } = await limiter.limit(key);
      return { allowed: success, remaining, resetAt: reset };
    } catch {
      // fall through to memory on an Upstash error
    }
  }

  return memCheck(key, limit, windowMs);
}

/**
 * Real client IP, accounting for proxies.
 *
 * NOTE: x-forwarded-for is client-controllable unless your platform overwrites
 * it. On Vercel it is set by the edge and safe. If you move to a host that does
 * not sanitise it, prefer the platform's own trusted header, or an attacker can
 * rotate this value freely and defeat rate limiting entirely.
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return (
    request.headers.get('x-real-ip') ??
    (forwarded ? forwarded.split(',')[0].trim() : null) ??
    request.headers.get('cf-connecting-ip') ??
    '127.0.0.1'
  );
}

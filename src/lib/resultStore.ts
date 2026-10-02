// src/lib/resultStore.ts
// Server-side only. Persists a completed scan result behind an unguessable
// token so it can be revisited at /r/<token>.
//
// ── WHY THIS EXISTS ────────────────────────────────────────────────────────
//
// The product had no reason to return. You scan once, fix your resume, and
// leave. That caps every revenue model, and it starves the two data moats
// (outcome capture and market aggregation) that only fill when users come back.
//
// Full accounts would solve it, but they collide head-on with the privacy
// position: "we never store your resume" is the strongest thing this product
// says about itself, and it is the reason to trust it over Jobscan or Teal.
//
// This is the version that does not make that trade. A result link stores only
// the ANALYSIS — score, keywords, suggestions — which contains no resume text
// and has already passed through the PII stripper. It requires no account, no
// email, and no identifier. The user holds the only reference.
//
// ── WHAT IS AND IS NOT STORED ──────────────────────────────────────────────
// Stored:     ScanResult (score, grade, summary, keyword lists, suggestions)
// NOT stored: the resume file, extracted resume text, the job description,
//             IP address, user agent, or anything linking the result to a person
//
// A ScanResult is the model's OUTPUT. Keyword names come from the job
// description, not from the candidate. Verify this holds if you ever add a
// field to ScanResult — an "extractedSummary" of the resume, for example, would
// break the guarantee and would need to be excluded here explicitly.

import { randomBytes } from 'crypto';
import type { ScanResult } from '@/types';

const KEY_PREFIX = 'res:v1:';

/** 30 days. Long enough to hear back from an application, short enough that
 *  abandoned links expire on their own without a cleanup job. */
const TTL_SECONDS = 60 * 60 * 24 * 30;

type RedisClient = import('@upstash/redis').Redis;
let redisPromise: Promise<RedisClient | null> | null = null;

function getRedis(): Promise<RedisClient | null> {
  if (redisPromise) return redisPromise;
  redisPromise = (async () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    try {
      const { Redis } = await import('@upstash/redis');
      return new Redis({ url, token });
    } catch {
      return null;
    }
  })();
  return redisPromise;
}

export interface StoredResult {
  result: ScanResult;
  /** Role slug the user selected, if any. Not personal data. */
  roleSlug: string | null;
  createdAt: string;
}

/**
 * 192 bits of entropy, base64url. Long enough that enumeration is not a
 * realistic attack — this is the only thing protecting a result, so it must not
 * be shortened for prettier URLs.
 */
export function generateResultToken(): string {
  return randomBytes(24).toString('base64url');
}

/** Token shape check. Rejects path traversal and oversized keys before any I/O. */
export function isValidToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{32}$/.test(token);
}

export async function saveResult(
  token: string,
  result: ScanResult,
  roleSlug: string | null,
): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) return false; // no Upstash configured — links are simply unavailable

  const payload: StoredResult = {
    result,
    roleSlug,
    createdAt: new Date().toISOString(),
  };

  try {
    await redis.set(KEY_PREFIX + token, payload, { ex: TTL_SECONDS });
    return true;
  } catch {
    return false;
  }
}

export async function loadResult(token: string): Promise<StoredResult | null> {
  if (!isValidToken(token)) return null;

  const redis = await getRedis();
  if (!redis) return null;

  try {
    return (await redis.get<StoredResult>(KEY_PREFIX + token)) ?? null;
  } catch {
    return null;
  }
}

/**
 * Delete a stored result.
 *
 * Anyone holding the token can delete it. That is deliberate: the token IS the
 * credential, there is no account to authenticate against, and the alternative
 * — no delete at all — would be worse. A user who shared a link and regrets it
 * must be able to revoke it.
 */
export async function deleteResult(token: string): Promise<boolean> {
  if (!isValidToken(token)) return false;

  const redis = await getRedis();
  if (!redis) return false;

  try {
    await redis.del(KEY_PREFIX + token);
    return true;
  } catch {
    return false;
  }
}

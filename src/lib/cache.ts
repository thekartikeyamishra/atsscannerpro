// src/lib/cache.ts
// Two-tier scan cache: Upstash Redis (shared, durable) → in-process LRU (fallback).
//
// WHY THIS FILE WAS REWRITTEN
// There were three caching modules with incompatible behaviour:
//   • src/lib/redis.ts     — key prefix "ats:",     TTL 24h,  JSON.stringify'd
//   • src/lib/localCache.ts— in-memory LRU,          TTL 15m
//   • src/lib/ai/cache.ts  — key prefix "ats:v2:",  TTL 30d,  raw object
// /api/scan used the first two; runAtsAnalysis() used the third. Identical
// scans therefore missed the cache roughly half the time and paid for a second
// Gemini call. This module replaces all three.
//
// The Upstash SDK serialises objects itself — the old redis.ts double-encoded
// by calling JSON.stringify() on write and JSON.parse() on read, which threw
// on any value the SDK had already parsed. Fixed here: store objects directly.

import { createHash } from 'crypto';
import type { ScanResult } from '@/types';

const KEY_PREFIX = 'ats:v3:'; // bump to invalidate after prompt/schema changes
const REDIS_TTL_SECONDS = 60 * 60 * 24; // 24h
const MEM_TTL_MS = 15 * 60 * 1000; // 15m — instances are ephemeral anyway
const MEM_MAX_ENTRIES = 200;

// ── Redis client (lazy, single init attempt) ────────────────────────────────
type RedisClient = import('@upstash/redis').Redis;

let redisPromise: Promise<RedisClient | null> | null = null;

function getRedis(): Promise<RedisClient | null> {
  if (redisPromise) return redisPromise;

  redisPromise = (async () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null; // local dev — LRU only

    try {
      const { Redis } = await import('@upstash/redis');
      return new Redis({ url, token });
    } catch {
      return null;
    }
  })();

  return redisPromise;
}

// ── In-process LRU fallback ─────────────────────────────────────────────────
interface Entry {
  value: ScanResult;
  expiresAt: number;
}

const mem = new Map<string, Entry>();

function memGet(key: string): ScanResult | null {
  const entry = mem.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    mem.delete(key);
    return null;
  }
  mem.delete(key); // re-insert to mark most-recently-used
  mem.set(key, entry);
  return entry.value;
}

function memSet(key: string, value: ScanResult): void {
  if (mem.size >= MEM_MAX_ENTRIES) {
    const oldest = mem.keys().next().value;
    if (oldest !== undefined) mem.delete(oldest);
  }
  mem.set(key, { value, expiresAt: Date.now() + MEM_TTL_MS });
}

// NOTE: the previous localCache.ts started a module-scope setInterval() to purge
// expired entries. On serverless that keeps the event loop referenced and can
// hold an instance alive past the response. Expiry is now checked lazily on read
// and the map is bounded, so no timer is needed.

// ── Key derivation ──────────────────────────────────────────────────────────
/**
 * Cache key from already-PII-stripped content. Whitespace is normalised and
 * text lowercased so cosmetic resume edits still hit the cache. SHA-256 means
 * no resume text is recoverable from a key, even inside Redis.
 */
export function cacheKey(resume: string, jobDescription: string, role = ''): string {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const digest = createHash('sha256')
    .update(norm(resume))
    .update('\u0000')
    .update(norm(jobDescription))
    .update('\u0000')
    .update(norm(role))
    .digest('hex');
  return KEY_PREFIX + digest.slice(0, 40);
}

// ── Public API ──────────────────────────────────────────────────────────────
export async function getCachedResult(key: string): Promise<ScanResult | null> {
  const local = memGet(key);
  if (local) return local;

  try {
    const redis = await getRedis();
    if (!redis) return null;

    const value = await redis.get<ScanResult>(key);
    if (!value) return null;

    memSet(key, value); // warm the local tier
    return value;
  } catch {
    return null; // never let a cache read fail a scan
  }
}

export async function setCachedResult(key: string, value: ScanResult): Promise<void> {
  memSet(key, value);

  try {
    const redis = await getRedis();
    if (redis) await redis.set(key, value, { ex: REDIS_TTL_SECONDS });
  } catch {
    // non-fatal — the local tier still holds it
  }
}

export async function isRedisAvailable(): Promise<boolean> {
  try {
    const redis = await getRedis();
    if (!redis) return false;
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

// src/lib/cache.ts
// Two-Tier Caching System (Memory LRU + Upstash Redis)
//
// DESIGN PRINCIPLES:
// 1. L1 (Memory): Extremely fast, eliminates network latency. Scoped to the current serverless container.
// 2. L2 (Redis): Shared across all serverless instances. 
// 3. Resilience: If Redis is unavailable or not configured, the app degrades gracefully to L1 or database.
// 4. Drift Prevention: L1 TTL is strictly capped (e.g., 5 mins) so individual lambda containers 
//    don't serve deeply stale data while L2 gets updated by another instance.

import { Redis } from '@upstash/redis';
// @ts-ignore - TS7016: If your environment lacks the types, run `npm i --save-dev @types/lru-cache`
import { LRUCache } from 'lru-cache';

// ============================================================================
// 1. Initialization
// ============================================================================

// Tier 2: Upstash Redis (Edge/Serverless friendly REST client)
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in environment.
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Tier 1: In-Memory LRU Cache
const memoryCache = new LRUCache<string, any>({
  max: 500, // Max items in memory to prevent container OOM
  ttl: 1000 * 60 * 5, // 5 minute max TTL for memory to prevent excessive instance drift
  updateAgeOnGet: false,
});

// ============================================================================
// 2. Core Operations
// ============================================================================

/**
 * Retrieves a value from the cache.
 * Sequence: Memory (L1) -> Redis (L2) -> Null
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // 1. Check local memory (L1)
  const memHit = memoryCache.get(key);
  if (memHit !== undefined) {
    return memHit as T;
  }

  // 2. Check remote Redis (L2)
  if (redis) {
    try {
      const redisHit = await redis.get<T>(key);
      if (redisHit !== null && redisHit !== undefined) {
        // Backfill memory cache so subsequent calls in this container are L1 hits
        const backfillTtl = 1000 * 60 * 5; // Standard backfill TTL
        memoryCache.set(key, redisHit, { ttl: backfillTtl });
        return redisHit;
      }
    } catch (error) {
      // Log but do not throw. A cache failure should never cause a 500 error.
      console.error(`[Cache] Redis GET error for key "${key}":`, error);
    }
  }

  return null;
}

/**
 * Sets a value in both L1 and L2 caches.
 * @param key The cache key
 * @param value The value to cache
 * @param ttlSeconds Time to live in seconds (default: 1 hour)
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
  if (value === undefined) return;

  // 1. Set local memory (L1)
  // Cap memory TTL to min(5 mins, requested TTL)
  const memoryTtlMs = Math.min(ttlSeconds * 1000, 1000 * 60 * 5);
  memoryCache.set(key, value, { ttl: memoryTtlMs });

  // 2. Set remote Redis (L2)
  if (redis) {
    try {
      // Fire-and-forget: Do not await the Redis write to prevent blocking the main request thread
      redis.set(key, value, { ex: ttlSeconds }).catch((err) => {
         console.error(`[Cache] Redis SET async error for key "${key}":`, err);
      });
    } catch (error) {
       console.error(`[Cache] Redis SET error for key "${key}":`, error);
    }
  }
}

/**
 * Standard Read-Through Cache Pattern.
 * Returns cached data if available, otherwise executes the fetcher function, caches, and returns the result.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  // Try Cache
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache Miss: Execute Fetcher
  const data = await fetcher();

  // Write to Cache
  if (data !== null && data !== undefined) {
    // We intentionally don't await this to speed up the response to the user
    setCache(key, data, ttlSeconds).catch(() => {});
  }

  return data;
}

/**
 * Invalidates a specific cache key in both tiers.
 */
export async function invalidateCache(key: string): Promise<void> {
  memoryCache.delete(key);
  
  if (redis) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`[Cache] Redis DEL error for key "${key}":`, error);
    }
  }
}
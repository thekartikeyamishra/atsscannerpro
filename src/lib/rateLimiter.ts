// src/lib/rateLimiter.ts
// Sliding-window rate limiting backed by Upstash Redis.
//
// DESIGN PRINCIPLES:
// 1. Abuse Prevention: Limits free resume scans per IP to prevent botting and API abuse.
// 2. Fail-Open: If Redis is down or unconfigured (e.g., local development without env vars), 
//    the limiter allows the request to proceed. It is better to serve a legitimate user 
//    than to throw a 500 error due to a caching layer failure.
// 3. Sliding Window: Preferred over fixed-window to prevent request bursts at the 
//    boundary resets (e.g., 5 requests at 1:59 and 5 requests at 2:01).

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client only if environment variables are present
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Configure the rate limiter: 5 requests per 1 hour per IP address
const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: false, // Disabled to reduce latency and Redis overhead
      prefix: 'ats_ratelimit',
    })
  : null;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks if the given identifier (usually an IP address) has exceeded the rate limit.
 * 
 * @param identifier The unique key to rate limit against (e.g., IP address).
 * @returns A RateLimitResult indicating success and current quota status.
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const fallbackReset = Date.now() + 3600000; // 1 hour from now in milliseconds

  // FAIL-OPEN: If Redis is not configured, bypass the rate limit.
  if (!ratelimit) {
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: fallbackReset,
    };
  }

  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(`scan_${identifier}`);
    
    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    // FAIL-OPEN: If the Redis network call fails, log the error and allow the request.
    console.error(`[RateLimiter] Error checking rate limit for ${identifier}:`, error);
    
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: fallbackReset,
    };
  }
}
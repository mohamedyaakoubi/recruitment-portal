/**
 * Production-Ready Rate Limiting
 * Uses Upstash Redis for distributed rate limiting across multiple instances
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Fallback to in-memory for development
let ratelimit: Ratelimit | null = null;
const inMemoryStore = new Map<string, { count: number; lastReset: number }>();

/**
 * Initialize rate limiter with Upstash Redis if available
 */
function getRateLimiter(): Ratelimit | null {
  // Only initialize once
  if (ratelimit !== null) {
    return ratelimit;
  }

  // Check if Upstash credentials are available
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const redis = new Redis({
        url: upstashUrl,
        token: upstashToken,
      });

      ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
        analytics: true,
        prefix: '@ratelimit',
      });

      return ratelimit;
    } catch (error) {
      console.error('Failed to initialize Upstash rate limiter:', error);
      return null;
    }
  }

  return null;
}

interface RateLimitConfig {
  requests: number;
  window: string; // e.g., '1 m', '1 h'
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = { requests: 60, window: '1 m' };

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/auth/*': { requests: 10, window: '1 m' },
  '/api/admin/*': { requests: 100, window: '1 m' },
  '/api/candidates/*': { requests: 50, window: '1 m' },
  '/api/upload/*': { requests: 10, window: '1 m' },
  // Enhanced rate limits for public endpoints (Priority 1.1)
  '/api/check-candidate': { requests: 10, window: '1 m' },
  '/api/check-duplicate': { requests: 10, window: '1 m' },
  '/api/get-candidate-applications': { requests: 20, window: '1 m' },
  '/api/validate-phone': { requests: 15, window: '1 m' },
  '/api/verify-email': { requests: 10, window: '1 m' },
};

/**
 * Get rate limit config for a path
 */
function getRateLimitConfig(path: string): RateLimitConfig {
  for (const [pattern, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*'));
      if (regex.test(path)) {
        return config;
      }
    }
  }
  return DEFAULT_RATE_LIMIT;
}

/**
 * Check if a request should be rate limited
 */
export async function checkRateLimit(
  identifier: string,
  path: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const limiter = getRateLimiter();
  const config = getRateLimitConfig(path);

  // Use Upstash if available
  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      console.error('Rate limit check failed, falling back to in-memory:', error);
      // Fall through to in-memory implementation
    }
  }

  // Fallback to in-memory rate limiting (for development)
  return checkRateLimitInMemory(identifier, config.requests);
}

/**
 * In-memory rate limiting fallback (for development only)
 */
function checkRateLimitInMemory(
  key: string,
  maxRequests: number
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const record = inMemoryStore.get(key);

  if (!record || now - record.lastReset > windowMs) {
    inMemoryStore.set(key, { count: 1, lastReset: now });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: record.lastReset + windowMs,
    };
  }

  record.count++;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    reset: record.lastReset + windowMs,
  };
}

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(request: {
  headers: Headers;
  nextUrl: { pathname: string };
}): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? (forwarded.split(',')[0]?.trim() ?? 'anonymous') : 'anonymous';
  return `${ip}:${request.nextUrl.pathname}`;
}

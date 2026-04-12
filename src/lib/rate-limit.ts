/**
 * Production-Ready Rate Limiting
 * Uses Upstash Redis for distributed rate limiting across multiple instances
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import logger from './logger';

// Fallback to in-memory for development - use globalThis to survive hot reloads
declare global {
  var __rateLimitStore: Map<string, { count: number; lastReset: number }> | undefined;

  var __upstashRedis: Redis | undefined;
}

// Initialize in-memory store that survives hot reloads
if (!globalThis.__rateLimitStore) {
  globalThis.__rateLimitStore = new Map<string, { count: number; lastReset: number }>();
}
const inMemoryStore = globalThis.__rateLimitStore;

/**
 * Get Redis client (singleton)
 */
function getRedisClient(): Redis | null {
  if (globalThis.__upstashRedis) {
    return globalThis.__upstashRedis;
  }

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      globalThis.__upstashRedis = new Redis({
        url: upstashUrl,
        token: upstashToken,
      });
      return globalThis.__upstashRedis;
    } catch (error) {
      logger.error('Failed to initialize Upstash Redis client', error);
      return null;
    }
  }

  return null;
}

interface RateLimitConfig {
  requests: number;
  window: string; // e.g., '1 m', '1 h'
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = { requests: 30, window: '1 m' };

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Authentication - very strict
  '/api/auth/*': { requests: 5, window: '1 m' },

  // Admin login page - strict to prevent brute force
  '/admin-dashboard-secret/login': { requests: 5, window: '1 m' },

  // OTP endpoints - very strict (3 requests per email per 10 min enforced in service layer)
  '/api/admin-auth/request-otp': { requests: 3, window: '10 m' },
  '/api/admin-auth/verify-otp': { requests: 10, window: '10 m' },

  // Admin endpoints - more generous for legitimate use
  '/api/admin/*': { requests: 60, window: '1 m' },
  '/api/candidates/*': { requests: 30, window: '1 m' },

  // File uploads - strict
  '/api/upload/*': { requests: 5, window: '1 m' },

  // Public candidate endpoints - moderate
  '/api/check-candidate': { requests: 5, window: '1 m' },
  '/api/check-duplicate': { requests: 5, window: '1 m' },
  '/api/get-candidate-applications': { requests: 10, window: '1 m' },

  // External API calls (cost money) - very strict
  '/api/validate-phone': { requests: 5, window: '1 m' },
  '/api/verify-email': { requests: 5, window: '1 m' },

  // Email sending - very strict
  '/api/send-confirmation-email': { requests: 3, window: '1 m' },

  // Interview scheduling
  '/api/cancel-interview': { requests: 10, window: '1 m' },
  '/api/schedule-interview-meet': { requests: 5, window: '1 m' },

  // OAuth
  '/api/google-auth/*': { requests: 10, window: '1 m' },

  // Export - strict (resource intensive)
  '/api/export-candidates': { requests: 3, window: '1 m' },

  // Jobs listing
  '/api/jobs': { requests: 20, window: '1 m' },
};

/**
 * Get rate limit config for a path
 */
function getRateLimitConfig(path: string): RateLimitConfig {
  // First check for exact match
  if (RATE_LIMIT_CONFIGS[path]) {
    return RATE_LIMIT_CONFIGS[path];
  }

  // Then check wildcard patterns
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
  const config = getRateLimitConfig(path);
  const redis = getRedisClient();

  // Use Upstash if available - create rate limiter with endpoint-specific config
  if (redis) {
    try {
      // Create a rate limiter with the specific config for this endpoint
      const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          config.requests,
          config.window as Parameters<typeof Ratelimit.slidingWindow>[1]
        ),
        analytics: true,
        prefix: '@ratelimit',
      });

      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      logger.error('Rate limit check failed, falling back to in-memory', error);
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

/**
 * CSRF Protection Implementation
 * Provides token generation and validation for state-changing operations.
 *
 * Secrets are stored in Upstash Redis (with in-memory fallback) so validation
 * works across separate Vercel Lambda invocations.
 */

import { randomBytes } from 'crypto';
import Tokens from 'csrf';
import logger from '@/lib/logger';

const tokens = new Tokens();

/** Key prefix for CSRF secrets in Redis */
const CSRF_PREFIX = 'csrf:';
/** 15 minutes — matches the cookie's maxAge */
const TTL_SECONDS = 15 * 60;

// In-memory fallback (same-process / dev without Redis)
const secretMemory = new Map<string, { secret: string; expiresAt: number }>();

async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const { Redis } = await import('@upstash/redis');
  return new Redis({ url, token });
}

async function secretSet(sessionId: string, secret: string): Promise<void> {
  const key = `${CSRF_PREFIX}${sessionId}`;
  secretMemory.set(key, { secret, expiresAt: Date.now() + TTL_SECONDS * 1000 });
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(key, secret, { ex: TTL_SECONDS });
    } catch (err) {
      logger.error('CSRF secret Redis set failed, using in-memory only', err);
    }
  }
}

async function secretGet(sessionId: string): Promise<string | null> {
  const key = `${CSRF_PREFIX}${sessionId}`;
  const redis = await getRedis();
  if (redis) {
    try {
      const val = await redis.get<string>(key);
      if (val !== null && val !== undefined) {
        return typeof val === 'string' ? val : JSON.stringify(val);
      }
    } catch (err) {
      logger.error('CSRF secret Redis get failed, falling back to in-memory', err);
    }
  }
  const entry = secretMemory.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    secretMemory.delete(key);
    return null;
  }
  return entry.secret;
}

async function secretDel(sessionId: string): Promise<void> {
  const key = `${CSRF_PREFIX}${sessionId}`;
  secretMemory.delete(key);
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.del(key);
    } catch (err) {
      logger.error('CSRF secret Redis del failed', err);
    }
  }
}

/**
 * Generate a CSRF token for a session (async — stores secret in Redis)
 */
export async function generateCsrfToken(sessionId: string): Promise<string> {
  const secret = tokens.secretSync();
  const token = tokens.create(secret);
  await secretSet(sessionId, secret);
  return token;
}

/**
 * Validate a CSRF token (async — reads secret from Redis)
 */
export async function validateCsrfToken(sessionId: string, token: string): Promise<boolean> {
  const secret = await secretGet(sessionId);
  if (!secret) return false;
  return tokens.verify(secret, token);
}

/**
 * Generate a session ID if not present
 */
export function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Remove a session's CSRF secret
 */
export async function removeCsrfToken(sessionId: string): Promise<void> {
  await secretDel(sessionId);
}

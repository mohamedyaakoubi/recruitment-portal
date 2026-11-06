/**
 * Magic Link Service for Candidate Authentication
 * Generates, stores, and verifies one-time magic link tokens.
 * Uses Upstash Redis with an in-memory fallback for development.
 */

import { createHash, randomBytes } from 'crypto';
import logger from '@/lib/logger';

export const MAGIC_LINK_TTL_SECONDS = 15 * 60; // 15 minutes

const KEY_PREFIX = 'magic-link:';

// In-memory fallback (dev / no Redis)
const memoryStore = new Map<string, { value: string; expiresAt: number }>();

async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const { Redis } = await import('@upstash/redis');
  return new Redis({ url, token });
}

async function storeSet(key: string, value: string, ttl: number): Promise<void> {
  // Always write to in-memory as a safety net (same-process reads will find it
  // even if Redis was unreachable during set but reachable during get).
  memoryStore.set(key, { value, expiresAt: Date.now() + ttl * 1000 });

  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttl });
    } catch (err) {
      logger.error('Redis storeSet failed, using in-memory only', err);
    }
  }
}

async function storeGet(key: string): Promise<string | null> {
  const redis = await getRedis();
  if (redis) {
    try {
      const val = await redis.get<string>(key);
      if (val !== null && val !== undefined) return val;
    } catch (err) {
      logger.error('Redis storeGet failed, falling back to in-memory', err);
    }
  }
  // Fallback: check in-memory (covers Redis miss after storeSet fell back to memory)
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

async function storeDel(key: string): Promise<void> {
  // Remove from both stores
  memoryStore.delete(key);

  const redis = await getRedis();
  if (redis) {
    try {
      await redis.del(key);
    } catch (err) {
      logger.error('Redis storeDel failed, removed from in-memory only', err);
    }
  }
  memoryStore.delete(key);
}

export type MagicLinkDest = 'choices' | 'form';

export interface MagicLinkPayload {
  email: string;
  dest: MagicLinkDest;
}

/**
 * Generate a secure 256-bit magic link token, store its SHA-256 hash,
 * and return the raw token for inclusion in the URL.
 */
export async function generateMagicLinkToken(payload: MagicLinkPayload): Promise<string> {
  const rawToken = randomBytes(32).toString('hex');
  const key = KEY_PREFIX + createHash('sha256').update(rawToken).digest('hex');
  await storeSet(
    key,
    JSON.stringify({ email: payload.email, dest: payload.dest }),
    MAGIC_LINK_TTL_SECONDS
  );
  logger.info('Magic link token generated', { dest: payload.dest });
  return rawToken;
}

// Short-lived cache of recently verified tokens.
// Handles browser double-fetches and email-client link scanners that consume
// the one-time token before the real user click arrives.
const recentVerifications = new Map<string, { payload: MagicLinkPayload; expiresAt: number }>();
const RECENT_VERIFY_TTL_MS = 60_000; // 60 seconds

/**
 * Verify a raw magic link token.
 * One-time use: deletes the stored entry on success.
 * Returns the payload on success, null on failure.
 */
export async function verifyMagicLinkToken(rawToken: string): Promise<MagicLinkPayload | null> {
  // Guard: token must be a 64-char lowercase hex string
  if (!/^[0-9a-f]{64}$/.test(rawToken)) return null;

  const key = KEY_PREFIX + createHash('sha256').update(rawToken).digest('hex');

  // Allow a recently consumed token to be re-used within a short window
  const recent = recentVerifications.get(key);
  if (recent) {
    if (Date.now() < recent.expiresAt) {
      logger.info('Magic link token re-verified from recent cache');
      return recent.payload;
    }
    recentVerifications.delete(key);
  }

  const stored = await storeGet(key);
  if (!stored) return null;

  // One-time use
  await storeDel(key);

  try {
    // Upstash Redis auto-deserializes JSON values, so `stored` may already be
    // an object.  In-memory fallback always returns the raw JSON string.
    const parsed: { email: string; dest: MagicLinkDest } =
      typeof stored === 'string' ? JSON.parse(stored) : stored;
    if (!parsed.email || !parsed.dest) return null;

    const payload: MagicLinkPayload = { email: parsed.email, dest: parsed.dest };

    // Cache for a short window so a duplicate request still succeeds
    recentVerifications.set(key, { payload, expiresAt: Date.now() + RECENT_VERIFY_TTL_MS });

    return payload;
  } catch {
    logger.error('Failed to parse magic link payload');
    return null;
  }
}

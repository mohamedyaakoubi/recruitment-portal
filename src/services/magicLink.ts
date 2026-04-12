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
  const redis = await getRedis();
  if (redis) {
    await redis.set(key, value, { ex: ttl });
    return;
  }
  memoryStore.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
}

async function storeGet(key: string): Promise<string | null> {
  const redis = await getRedis();
  if (redis) return redis.get<string>(key);
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

async function storeDel(key: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.del(key);
    return;
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

/**
 * Verify a raw magic link token.
 * One-time use: deletes the stored entry on success.
 * Returns the payload on success, null on failure.
 */
export async function verifyMagicLinkToken(rawToken: string): Promise<MagicLinkPayload | null> {
  // Guard: token must be a 64-char lowercase hex string
  if (!/^[0-9a-f]{64}$/.test(rawToken)) return null;

  const key = KEY_PREFIX + createHash('sha256').update(rawToken).digest('hex');
  const stored = await storeGet(key);
  if (!stored) return null;

  // One-time use
  await storeDel(key);

  try {
    const parsed = JSON.parse(stored) as { email: string; dest: MagicLinkDest };
    if (!parsed.email || !parsed.dest) return null;
    return { email: parsed.email, dest: parsed.dest };
  } catch {
    logger.error('Failed to parse magic link payload');
    return null;
  }
}

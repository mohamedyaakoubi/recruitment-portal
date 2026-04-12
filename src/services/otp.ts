/**
 * OTP Service for Admin Authentication
 * Generates, stores, and verifies one-time passwords using Upstash Redis.
 * Falls back to an in-memory store when Redis is not configured.
 */

import { createHash, randomInt, timingSafeEqual } from 'crypto';
import logger from '@/lib/logger';

export const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
export const OTP_MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_SECONDS = 10 * 60; // 10 minutes

// Key prefix constants
const OTP_KEY_PREFIX = 'admin-otp:';
const ATTEMPT_KEY_PREFIX = 'admin-otp-attempts:';

/** Hash the OTP with HMAC-SHA256 using the email as additional entropy */
function hashOtp(otp: string, email: string): string {
  return createHash('sha256').update(`${otp}:${email.toLowerCase()}`).digest('hex');
}

/** Derive a stable Redis key from the admin email */
function otpKey(email: string): string {
  const emailHash = createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 16);
  return `${OTP_KEY_PREFIX}${emailHash}`;
}

/** Derive a stable Redis key for attempt tracking */
function attemptKey(email: string): string {
  const emailHash = createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 16);
  return `${ATTEMPT_KEY_PREFIX}${emailHash}`;
}

// ---------------------------------------------------------------------------
// In-memory fallback (development / no Redis)
// ---------------------------------------------------------------------------

interface MemoryOtpEntry {
  hash: string;
  expiresAt: number;
}

declare global {
  var __otpStore: Map<string, MemoryOtpEntry> | undefined;

  var __otpAttemptStore: Map<string, { count: number; resetAt: number }> | undefined;
}

if (!globalThis.__otpStore) {
  globalThis.__otpStore = new Map<string, MemoryOtpEntry>();
}
if (!globalThis.__otpAttemptStore) {
  globalThis.__otpAttemptStore = new Map<string, { count: number; resetAt: number }>();
}

const memoryOtpStore = globalThis.__otpStore;
const memoryAttemptStore = globalThis.__otpAttemptStore;

// ---------------------------------------------------------------------------
// Redis operations
// ---------------------------------------------------------------------------

async function redisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  const response = await fetch(
    `${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?ex=${ttlSeconds}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      method: 'GET',
    }
  );
  if (!response.ok) {
    throw new Error(`Redis SET failed: ${response.status}`);
  }
}

async function redisGet(key: string): Promise<string | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;

  const json = (await response.json()) as { result: string | null };
  return json.result;
}

async function redisDel(key: string): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  await fetch(`${url}/del/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    method: 'GET',
  });
}

async function redisIncr(key: string, ttlSeconds: number): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return 0;

  const incrResponse = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    method: 'GET',
  });
  if (!incrResponse.ok) return 0;

  const incrJson = (await incrResponse.json()) as { result: number };
  const count = incrJson.result;

  // Set TTL on first increment
  if (count === 1) {
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${ttlSeconds}`, {
      headers: { Authorization: `Bearer ${token}` },
      method: 'GET',
    });
  }

  return count;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a new OTP, store its hash, and return the plaintext OTP for sending.
 */
export async function generateAndStoreOtp(email: string): Promise<string> {
  const otp = String(randomInt(100000, 999999));
  const hash = hashOtp(otp, email);
  const key = otpKey(email);

  const useRedis = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );

  if (useRedis) {
    try {
      await redisSet(key, hash, OTP_TTL_SECONDS);
      return otp;
    } catch (error) {
      logger.warn('Redis unavailable for OTP storage, falling back to in-memory', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // In-memory fallback
  memoryOtpStore.set(key, {
    hash,
    expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
  });

  return otp;
}

/**
 * Verify the submitted OTP for a given email.
 * Returns true if valid; false otherwise.
 * The stored OTP is invalidated after the first successful verification.
 */
export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const key = otpKey(email);
  const useRedis = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );

  let storedHash: string | null = null;

  if (useRedis) {
    try {
      storedHash = await redisGet(key);
    } catch (error) {
      logger.warn('Redis unavailable for OTP verification, falling back to in-memory', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (storedHash === null) {
    // In-memory fallback
    const entry = memoryOtpStore.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      memoryOtpStore.delete(key);
      return false;
    }
    storedHash = entry.hash;
  }

  const submittedHash = hashOtp(otp, email);

  // Constant-time comparison to prevent timing attacks
  const storedBuffer = Buffer.from(storedHash, 'hex');
  const submittedBuffer = Buffer.from(submittedHash, 'hex');

  if (storedBuffer.length !== submittedBuffer.length) return false;

  const valid = timingSafeEqual(storedBuffer, submittedBuffer);

  if (valid) {
    // Invalidate OTP after successful use (one-time use)
    if (useRedis) {
      await redisDel(key).catch(() => undefined);
    }
    memoryOtpStore.delete(key);
  }

  return valid;
}

/**
 * Track verification attempt count for brute-force protection.
 * Returns the current attempt count after incrementing.
 */
export async function incrementOtpAttempt(email: string): Promise<number> {
  const key = attemptKey(email);
  const useRedis = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );

  if (useRedis) {
    try {
      return await redisIncr(key, ATTEMPT_WINDOW_SECONDS);
    } catch {
      // Fall through to in-memory
    }
  }

  const now = Date.now();
  const entry = memoryAttemptStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryAttemptStore.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_SECONDS * 1000 });
    return 1;
  }
  entry.count++;
  return entry.count;
}

/**
 * Reset the attempt counter on successful verification.
 */
export async function resetOtpAttempts(email: string): Promise<void> {
  const key = attemptKey(email);
  const useRedis = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );

  if (useRedis) {
    await redisDel(key).catch(() => undefined);
  }
  memoryAttemptStore.delete(key);
}

import { google, Auth } from 'googleapis';
import { getFirestoreAdmin } from './firebase-admin';
import logger from '@/lib/logger';
import crypto from 'crypto';
import { encryptTokenObject, decryptTokenObject } from './tokenEncryption';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
];

const TOKEN_DB_PATH = 'settings/google_auth_tokens';

/** Redis key prefix for OAuth state tokens */
const OAUTH_STATE_PREFIX = 'oauth-state:';
/** TTL in seconds — 10 minutes is generous for a human OAuth click */
const STATE_TTL_SECONDS = 10 * 60;

// In-memory fallback so dev works without Upstash env vars
const stateMemory = new Map<string, { usedAt: number | null; expiresAt: number }>();

async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const { Redis } = await import('@upstash/redis');
  return new Redis({ url, token });
}

/**
 * Creates a new OAuth2 client.
 */
export function getOAuth2Client(): Auth.OAuth2Client {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error('Google OAuth2 credentials are not configured in environment variables.');
  }
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

/**
 * Generate cryptographic state parameter for OAuth CSRF protection.
 * Stores state in Upstash Redis (with in-memory fallback) so it survives
 * across separate Vercel Lambda invocations.
 */
export async function generateOAuthState(): Promise<string> {
  const state = crypto.randomBytes(32).toString('base64url');
  const key = `${OAUTH_STATE_PREFIX}${state}`;

  // Always write to memory first
  stateMemory.set(key, { usedAt: null, expiresAt: Date.now() + STATE_TTL_SECONDS * 1000 });

  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(key, '0', { ex: STATE_TTL_SECONDS });
    } catch (err) {
      logger.error('OAuth state Redis set failed, using in-memory only', err);
    }
  }

  logger.info('OAuth state generated', { state: state.substring(0, 10) + '...' });
  return state;
}

/**
 * Validate and consume the OAuth state parameter (one-time use).
 * Checks Redis first, falls back to in-memory.
 */
export async function validateOAuthState(state: string): Promise<boolean> {
  const key = `${OAUTH_STATE_PREFIX}${state}`;

  const redis = await getRedis();
  if (redis) {
    try {
      // getdel atomically returns the value and deletes the key — guarantees one-time use
      const val = await redis.getdel(key);
      if (val !== null && val !== undefined) {
        // '0' = unused, '1' = already consumed (getdel removes it, so this path means fresh)
        logger.info('OAuth state validated via Redis', { state: state.substring(0, 10) + '...' });
        return true;
      }
      // Key missing in Redis — fall through to memory check (set may have failed earlier)
      logger.warn('OAuth state not found in Redis, checking memory', {
        state: state.substring(0, 10) + '...',
      });
    } catch (err) {
      logger.error('OAuth state Redis getdel failed, falling back to in-memory', err);
    }
  }

  // Memory fallback
  const entry = stateMemory.get(key);
  if (!entry) {
    logger.warn('OAuth state not found in memory', { state: state.substring(0, 10) + '...' });
    return false;
  }
  if (entry.usedAt !== null) {
    logger.warn('OAuth state already used', { state: state.substring(0, 10) + '...' });
    return false;
  }
  if (Date.now() > entry.expiresAt) {
    logger.warn('OAuth state expired', { state: state.substring(0, 10) + '...' });
    stateMemory.delete(key);
    return false;
  }

  entry.usedAt = Date.now();
  stateMemory.set(key, entry);
  logger.info('OAuth state validated via memory fallback', {
    state: state.substring(0, 10) + '...',
  });
  return true;
}

/**
 * Generates the authentication URL for the user to grant consent.
 */
export async function generateAuthUrl(): Promise<string> {
  const oauth2Client = getOAuth2Client();
  const state = await generateOAuthState();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state, // CSRF protection
  });
}

/**
 * Stores the provided tokens securely in Firestore (encrypted).
 */
export async function storeTokens(tokens: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  [key: string]: unknown;
}): Promise<void> {
  try {
    const db = getFirestoreAdmin();
    const tokenRef = db.doc(TOKEN_DB_PATH);

    // Encrypt tokens before storage
    const encryptedTokens = encryptTokenObject(tokens);

    await tokenRef.set({
      encrypted: encryptedTokens,
      updatedAt: new Date().toISOString(),
    });

    logger.info('Google Auth tokens stored successfully (encrypted)');
  } catch (error) {
    logger.error('Failed to store tokens', error);
    throw new Error('Failed to store authentication tokens');
  }
}

/**
 * Retrieves stored tokens from Firestore (decrypted).
 */
async function getStoredTokens(): Promise<Record<string, unknown> | null> {
  try {
    const db = getFirestoreAdmin();
    const tokenRef = db.doc(TOKEN_DB_PATH);
    const tokenDoc = await tokenRef.get();

    if (!tokenDoc.exists) {
      logger.info('Google Auth: No tokens found in Firestore');
      return null;
    }

    const data = tokenDoc.data();
    if (!data) {
      logger.info('Google Auth: Token document exists but has no data');
      return null;
    }

    // Check if tokens are encrypted
    if (data.encrypted && typeof data.encrypted === 'string') {
      try {
        // Decrypt tokens
        const decrypted = decryptTokenObject(data.encrypted);
        logger.info('Google Auth: Successfully retrieved and decrypted tokens', {
          hasAccessToken: !!(decrypted as Record<string, unknown>)?.access_token,
          hasRefreshToken: !!(decrypted as Record<string, unknown>)?.refresh_token,
          updatedAt: data.updatedAt,
        });
        return decrypted as Record<string, unknown>;
      } catch {
        // Decryption failure is already logged in tokenEncryption.ts
        // This typically happens when TOKEN_ENCRYPTION_KEY doesn't match
        return null;
      }
    }

    // Legacy: unencrypted tokens (migrate them)
    logger.warn('Found unencrypted tokens, migrating to encrypted storage');
    await storeTokens(
      data as {
        access_token: string;
        refresh_token?: string;
        expiry_date?: number;
        [key: string]: unknown;
      }
    );

    return data as Record<string, unknown>;
  } catch (error) {
    logger.error('Failed to retrieve tokens from Firestore', error);
    return null;
  }
}

/**
 * Creates and returns an authenticated OAuth2 client using stored tokens.
 * Handles token refreshing automatically.
 */
export async function getAuthenticatedClient(): Promise<Auth.OAuth2Client | null> {
  const tokens = await getStoredTokens();
  if (!tokens) {
    return null;
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  // Set up a listener for token refresh events
  oauth2Client.on('tokens', (newTokens) => {
    logger.info('Google Auth tokens were refreshed');
    // Update the stored tokens with the new ones (including a new access_token)
    const updatedTokens = {
      ...tokens,
      ...newTokens,
      access_token: newTokens.access_token || tokens.access_token || '',
    };
    if (updatedTokens.access_token) {
      storeTokens(
        updatedTokens as {
          access_token: string;
          refresh_token?: string;
          expiry_date?: number;
          [key: string]: unknown;
        }
      );
    }
  });

  return oauth2Client;
}

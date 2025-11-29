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
const _STATE_DB_PATH = 'settings/oauth_states';

// In-memory state storage for OAuth flow (valid for 10 minutes)
const oauthStates = new Map<string, { timestamp: number; used: boolean }>();
const STATE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

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
 * Generate cryptographic state parameter for OAuth CSRF protection
 */
export function generateOAuthState(): string {
  const state = crypto.randomBytes(32).toString('base64url');
  oauthStates.set(state, { timestamp: Date.now(), used: false });

  // Clean up expired states
  const now = Date.now();
  for (const [key, value] of oauthStates.entries()) {
    if (now - value.timestamp > STATE_EXPIRATION_MS) {
      oauthStates.delete(key);
    }
  }

  logger.info('OAuth state generated', { state: state.substring(0, 10) + '...' });
  return state;
}

/**
 * Validate OAuth state parameter
 */
export function validateOAuthState(state: string): boolean {
  const stored = oauthStates.get(state);

  if (!stored) {
    logger.warn('OAuth state not found', { state: state.substring(0, 10) + '...' });
    return false;
  }

  if (stored.used) {
    logger.warn('OAuth state already used', { state: state.substring(0, 10) + '...' });
    return false;
  }

  const now = Date.now();
  if (now - stored.timestamp > STATE_EXPIRATION_MS) {
    logger.warn('OAuth state expired', { state: state.substring(0, 10) + '...' });
    oauthStates.delete(state);
    return false;
  }

  // Mark as used
  stored.used = true;
  oauthStates.set(state, stored);

  // Clean up after validation
  setTimeout(() => oauthStates.delete(state), 60000); // Delete after 1 minute

  return true;
}

/**
 * Generates the authentication URL for the user to grant consent.
 */
export function generateAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  const state = generateOAuthState();

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

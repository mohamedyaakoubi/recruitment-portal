import { google } from 'googleapis';
import { getFirestoreAdmin } from './firebase-admin';
import logger from '@/lib/logger';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email', // Add this scope to request email permission
];

const TOKEN_DB_PATH = 'settings/google_auth_tokens';

/**
 * Creates a new OAuth2 client.
 */
export function getOAuth2Client() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error('Google OAuth2 credentials are not configured in environment variables.');
  }
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

/**
 * Generates the authentication URL for the user to grant consent.
 */
export function generateAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' gets a refresh token
    scope: SCOPES,
    prompt: 'consent', // Force prompt for consent to ensure refresh token is sent
  });
}

/**
 * Stores the provided tokens securely in Firestore.
 */
export async function storeTokens(tokens: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  [key: string]: unknown;
}) {
  const db = getFirestoreAdmin();
  const tokenRef = db.doc(TOKEN_DB_PATH);
  await tokenRef.set(tokens);
  logger.info('Google Auth tokens stored successfully in Firestore');
}

/**
 * Retrieves stored tokens from Firestore.
 */
async function getStoredTokens() {
  const db = getFirestoreAdmin();
  const tokenRef = db.doc(TOKEN_DB_PATH);
  const tokenDoc = await tokenRef.get();

  if (!tokenDoc.exists) {
    logger.warn('Google Auth tokens not found in Firestore');
    return null;
  }
  return tokenDoc.data();
}

/**
 * Creates and returns an authenticated OAuth2 client using stored tokens.
 * Handles token refreshing automatically.
 */
export async function getAuthenticatedClient() {
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

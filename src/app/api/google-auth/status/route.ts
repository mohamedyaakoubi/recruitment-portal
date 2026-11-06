import { getAuthenticatedClient } from '@/lib/googleOAuth';
import { google } from 'googleapis';
import logger from '@/lib/logger';
import { successResponse } from '@/lib/apiResponse';

// Note: This endpoint doesn't require explicit admin auth because:
// 1. It's only called from the admin dashboard (which requires auth)
// 2. It only returns connection status, no sensitive data
// 3. Requiring auth here causes false security alerts on page load
export async function GET() {
  try {
    const auth = await getAuthenticatedClient();

    if (!auth) {
      logger.info('Google auth status: No authenticated client (tokens not found)');
      return successResponse({ isConnected: false, email: null });
    }

    // Check if we have credentials set
    const credentials = auth.credentials;
    if (!credentials || !credentials.access_token) {
      logger.info('Google auth status: No access token in credentials');
      return successResponse({ isConnected: false, email: null });
    }

    // Use the authenticated client to get user info
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const userInfoResponse = await oauth2.userinfo.get();

    const email = userInfoResponse.data.email;

    if (!email) {
      logger.warn('Google auth status: Connected but no email returned');
      return successResponse({ isConnected: false, email: null });
    }

    logger.info('Google auth status: Connected', { email });
    return successResponse({ isConnected: true, email: email });
  } catch (error) {
    // Check if it's a token refresh error
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Token decryption failure - key mismatch between environments
    if (
      errorMessage.includes('Failed to decrypt token') ||
      errorMessage.includes('Unsupported state or unable to authenticate data')
    ) {
      logger.warn(
        'Google auth status: Token decryption failed - encryption key mismatch. User needs to reconnect Google Calendar.',
        {
          hint: 'Ensure TOKEN_ENCRYPTION_KEY is the same in all environments (local and Vercel)',
        }
      );
      return successResponse({ isConnected: false, email: null, requiresReconnect: true });
    }

    if (
      errorMessage.includes('invalid_grant') ||
      errorMessage.includes('Token has been expired or revoked')
    ) {
      logger.warn('Google auth status: Token expired or revoked, user needs to reconnect');
    } else {
      logger.error('Error checking Google auth status', error);
    }

    // This can happen if tokens are invalid/revoked. Treat as not connected.
    return successResponse({ isConnected: false, email: null });
  }
}

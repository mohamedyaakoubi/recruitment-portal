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
      return successResponse({ isConnected: false, email: null });
    }

    // Use the authenticated client to get user info
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const userInfoResponse = await oauth2.userinfo.get();

    const email = userInfoResponse.data.email;

    if (!email) {
      return successResponse({ isConnected: false, email: null });
    }

    return successResponse({ isConnected: true, email: email });
  } catch (error) {
    logger.error('Error checking Google auth status', error);
    // This can happen if tokens are invalid/revoked. Treat as not connected.
    return successResponse({ isConnected: false, email: null });
  }
}

import { NextRequest } from 'next/server';
import { getAuthenticatedClient } from '@/lib/googleOAuth';
import { requireAdminAuth } from '@/lib/auth';
import { google } from 'googleapis';
import logger from '@/lib/logger';
import { successResponse } from '@/lib/apiResponse';

export async function GET(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

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

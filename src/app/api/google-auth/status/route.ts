import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/googleOAuth';
import { google } from 'googleapis';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const auth = await getAuthenticatedClient();

    if (!auth) {
      return NextResponse.json({ isConnected: false, email: null });
    }

    // Use the authenticated client to get user info
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const userInfoResponse = await oauth2.userinfo.get();

    const email = userInfoResponse.data.email;

    if (!email) {
      return NextResponse.json({ isConnected: false, email: null });
    }

    return NextResponse.json({ isConnected: true, email: email });
  } catch (error) {
    logger.error('Error checking Google auth status', error);
    // This can happen if tokens are invalid/revoked. Treat as not connected.
    return NextResponse.json({ isConnected: false, email: null });
  }
}

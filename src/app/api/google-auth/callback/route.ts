import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client, storeTokens, validateOAuthState } from '@/lib/googleOAuth';
import logger from '@/lib/logger';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '/';
  const context = extractSecurityContext(request);

  // Validate state parameter (CSRF protection)
  if (!state || !(await validateOAuthState(state))) {
    logger.error('OAuth callback: Invalid or missing state parameter', { state });
    logSecurityEvent({
      type: SecurityEventType.CSRF_VALIDATION_FAILED,
      ...context,
      details: { reason: 'Invalid OAuth state parameter', flow: 'google_oauth' },
    });
    return NextResponse.redirect(`${appUrl}?error=oauth_csrf_failed`);
  }

  if (!code) {
    logger.error('Google auth callback error: No code received');
    logSecurityEvent({
      type: SecurityEventType.AUTH_FAILURE,
      ...context,
      details: { reason: 'No OAuth code received' },
    });
    return NextResponse.redirect(`${appUrl}?error=google_auth_failed`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    await storeTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      ...tokens,
    } as {
      access_token: string;
      refresh_token?: string;
      expiry_date?: number;
      [key: string]: unknown;
    });

    // Redirect to the dashboard or a settings page with a success message
    return NextResponse.redirect(`${appUrl}/admin-dashboard-secret?success=google_auth_complete`);
  } catch (error) {
    logger.error('Error exchanging code for tokens', error);
    return NextResponse.redirect(`${appUrl}?error=google_token_exchange_failed`);
  }
}

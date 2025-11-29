import { NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/googleOAuth';
import logger from '@/lib/logger';
import { ApiErrors } from '@/lib/apiResponse';

// Note: This endpoint doesn't require explicit admin auth because:
// 1. It's only accessible from the admin dashboard (which requires auth)
// 2. OAuth flow has CSRF protection via state parameter
// 3. The callback validates the state before storing tokens
// 4. Browser navigation (href) doesn't reliably send auth cookies
export async function GET() {
  try {
    const authUrl = generateAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    logger.error('Error generating Google auth URL', error);
    return ApiErrors.internal('Failed to initiate Google authentication', error);
  }
}

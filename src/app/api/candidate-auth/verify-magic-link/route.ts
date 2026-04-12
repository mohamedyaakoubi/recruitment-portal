import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLinkToken } from '@/services/magicLink';
import {
  createSessionCookieValue,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from '@/lib/candidate-session';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const context = extractSecurityContext(request);
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') ?? '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const payload = await verifyMagicLinkToken(token);

  if (!payload) {
    logSecurityEvent({
      type: SecurityEventType.AUTH_FAILURE,
      ...context,
      details: { reason: 'Invalid or expired magic link token' },
    });
    logger.warn('Magic link verification failed');
    return NextResponse.redirect(new URL('/?error=link_expired', appUrl));
  }

  const { email, dest } = payload;
  const redirectPath =
    dest === 'choices'
      ? `/candidate-choices?email=${encodeURIComponent(email)}`
      : `/candidate-form?email=${encodeURIComponent(email)}`;

  const response = NextResponse.redirect(new URL(redirectPath, appUrl));

  response.cookies.set(SESSION_COOKIE_NAME, await createSessionCookieValue(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  logger.info('Magic link verified, session created', { dest });
  return response;
}

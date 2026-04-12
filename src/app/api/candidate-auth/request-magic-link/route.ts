import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { ApiErrors, successResponse } from '@/lib/apiResponse';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import logger from '@/lib/logger';
import {
  generateMagicLinkToken,
  MAGIC_LINK_TTL_SECONDS,
  MagicLinkDest,
} from '@/services/magicLink';
import { sendMagicLinkEmail } from '@/services/email';
import { verifyEmail } from '@/services/emailVerification';
import { getFirestoreAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
});

export async function POST(request: NextRequest) {
  const context = extractSecurityContext(request);
  const identifier = getRateLimitIdentifier(request);

  const rateLimitResult = await checkRateLimit(
    identifier,
    '/api/candidate-auth/request-magic-link'
  );
  if (!rateLimitResult.success) {
    logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      ...context,
      details: { endpoint: '/api/candidate-auth/request-magic-link' },
    });
    return ApiErrors.tooManyRequests(
      'Too many requests. Please wait before requesting another link.'
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ApiErrors.badRequest('Invalid JSON body');
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    logSecurityEvent({
      type: SecurityEventType.INPUT_VALIDATION_FAILED,
      ...context,
      details: {
        endpoint: '/api/candidate-auth/request-magic-link',
        errors: parsed.error.flatten(),
      },
    });
    return ApiErrors.badRequest('Invalid email address', parsed.error.flatten());
  }

  const { email } = parsed.data;

  // Layer 2 + 3: DNS MX, disposable domain blocklist, and Abstract API deep verification.
  // Wrapped in try/catch so that a verification service failure never blocks the magic link flow.
  try {
    const emailCheck = await verifyEmail(email);
    if (!emailCheck.isValid) {
      logSecurityEvent({
        type: SecurityEventType.INPUT_VALIDATION_FAILED,
        ...context,
        details: {
          endpoint: '/api/candidate-auth/request-magic-link',
          reason: emailCheck.error,
          disposable: emailCheck.disposable,
        },
      });
      return ApiErrors.badRequest(
        emailCheck.disposable
          ? 'Disposable email addresses are not accepted. Please use a permanent email address.'
          : 'This email address could not be verified. Please check it and try again.'
      );
    }
  } catch (verifyError) {
    // Fail open: log the error but do not block the request.
    // Email format is already validated by Zod; verification is best-effort.
    logger.error('Email verification service threw unexpectedly, continuing', verifyError);
  }

  // Server-side destination determination — never trust client input
  let dest: MagicLinkDest = 'form';
  try {
    const db = getFirestoreAdmin();
    const snap = await db.collection('candidates').where('email', '==', email).get();
    dest = !snap.empty && snap.size > 0 ? 'choices' : 'form';
  } catch (dbError) {
    logger.error('Firestore candidate lookup failed during magic link request', dbError);
    // Fail safe: default to 'form' (new user flow) if DB is unreachable
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Generate and send — always return success to prevent email enumeration
  try {
    const rawToken = await generateMagicLinkToken({ email, dest });
    const magicLinkUrl = `${appUrl}/api/candidate-auth/verify-magic-link?token=${rawToken}`;
    await sendMagicLinkEmail({
      to: email,
      magicLinkUrl,
      expiryMinutes: Math.floor(MAGIC_LINK_TTL_SECONDS / 60),
    });
    logger.info('Magic link requested', { dest });
  } catch (error) {
    // Log internally; do not expose failure details to caller
    logger.error('Failed to generate or send magic link', error);
  }

  return successResponse({
    message: 'If this email address is valid, a sign-in link has been sent.',
  });
}

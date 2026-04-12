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

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
  dest: z.enum(['choices', 'form']).default('form'),
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

  const { email, dest } = parsed.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Generate and send — always return success to prevent email enumeration
  try {
    const rawToken = await generateMagicLinkToken({ email, dest: dest as MagicLinkDest });
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

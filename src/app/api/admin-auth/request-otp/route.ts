import { NextRequest } from 'next/server';
import { z } from 'zod';
import { validateOrigin, getOriginValidationError } from '@/lib/origin-validation';
import { ApiErrors, successResponse } from '@/lib/apiResponse';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import logger from '@/lib/logger';
import { generateAndStoreOtp } from '@/services/otp';
import { sendAdminOtpEmail } from '@/services/email';

export const dynamic = 'force-dynamic';

const requestOtpSchema = z.object({
  email: z.string().email().max(254).toLowerCase(),
});

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return [];
  return raw.split(',').map((e) => e.trim().toLowerCase());
}

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) {
    const error = getOriginValidationError();
    return ApiErrors.forbidden(error.error);
  }

  const context = extractSecurityContext(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ApiErrors.badRequest('Invalid JSON body');
  }

  const parsed = requestOtpSchema.safeParse(body);
  if (!parsed.success) {
    logSecurityEvent({
      type: SecurityEventType.INPUT_VALIDATION_FAILED,
      ...context,
      details: { endpoint: '/api/admin-auth/request-otp', errors: parsed.error.flatten() },
    });
    return ApiErrors.badRequest('Validation failed', parsed.error.flatten());
  }

  const { email } = parsed.data;
  const adminEmails = getAdminEmails();

  if (!adminEmails.includes(email)) {
    // Return generic success to prevent email enumeration
    logSecurityEvent({
      type: SecurityEventType.AUTH_FAILURE,
      ...context,
      details: { reason: 'OTP requested for non-admin email', email },
    });
    logger.warn('OTP requested for non-admin email', { email: '[redacted]' });
    return successResponse(
      { message: 'If the email is authorized, a code has been sent.' },
      { status: 200 }
    );
  }

  try {
    const otp = await generateAndStoreOtp(email);
    await sendAdminOtpEmail(email, otp);
    logger.info('Admin OTP sent', { email: '[redacted]' });
    return successResponse({ message: 'Verification code sent to your email.' });
  } catch (error) {
    logger.error('Failed to send admin OTP', error, { email: '[redacted]' });
    return ApiErrors.internal('Failed to send verification code. Please try again.');
  }
}

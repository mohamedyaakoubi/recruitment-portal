import { NextRequest } from 'next/server';
import { z } from 'zod';
import { validateOrigin, getOriginValidationError } from '@/lib/origin-validation';
import { ApiErrors, successResponse } from '@/lib/apiResponse';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import logger from '@/lib/logger';
import { verifyOtp, incrementOtpAttempt, resetOtpAttempts, OTP_MAX_ATTEMPTS } from '@/services/otp';
import { getAuthAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const verifyOtpSchema = z.object({
  email: z.string().email().max(254).toLowerCase(),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, 'OTP must be a 6-digit number'),
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

  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    logSecurityEvent({
      type: SecurityEventType.INPUT_VALIDATION_FAILED,
      ...context,
      details: { endpoint: '/api/admin-auth/verify-otp', errors: parsed.error.flatten() },
    });
    return ApiErrors.badRequest('Validation failed', parsed.error.flatten());
  }

  const { email, otp } = parsed.data;
  const adminEmails = getAdminEmails();

  if (!adminEmails.includes(email)) {
    logSecurityEvent({
      type: SecurityEventType.AUTH_FAILURE,
      ...context,
      details: { reason: 'OTP verification attempt for non-admin email' },
    });
    return ApiErrors.unauthorized('Invalid credentials');
  }

  // Brute-force protection: track attempts before OTP verification
  const attempts = await incrementOtpAttempt(email);
  if (attempts > OTP_MAX_ATTEMPTS) {
    logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      ...context,
      details: { reason: 'OTP attempt limit exceeded', attempts },
    });
    logger.warn('OTP brute-force attempt detected', { email: '[redacted]', attempts });
    return ApiErrors.tooManyRequests('Too many verification attempts. Please request a new code.');
  }

  const valid = await verifyOtp(email, otp);

  if (!valid) {
    logSecurityEvent({
      type: SecurityEventType.AUTH_FAILURE,
      ...context,
      details: { reason: 'Invalid or expired OTP', attempt: attempts },
    });
    logger.warn('Invalid OTP submitted', { email: '[redacted]', attempts });
    return ApiErrors.unauthorized('Invalid or expired verification code.');
  }

  // OTP verified — reset attempt counter
  await resetOtpAttempts(email);

  try {
    // Fetch or create Firebase user for this admin email and issue a custom token
    const authAdmin = getAuthAdmin();
    let uid: string;

    try {
      const existingUser = await authAdmin.getUserByEmail(email);
      uid = existingUser.uid;
    } catch {
      // User does not exist — create a minimal Firebase Auth entry
      const newUser = await authAdmin.createUser({ email, emailVerified: true });
      uid = newUser.uid;
      logger.info('Created new Firebase Auth entry for admin', { email: '[redacted]' });
    }

    const customToken = await authAdmin.createCustomToken(uid, { admin: true });

    logger.info('Admin OTP verified, custom token issued', { email: '[redacted]' });
    return successResponse({ customToken });
  } catch (error) {
    logger.error('Failed to create Firebase custom token', error, { email: '[redacted]' });
    return ApiErrors.internal('Authentication failed. Please try again.');
  }
}

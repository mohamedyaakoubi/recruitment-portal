import { NextRequest } from 'next/server';
import { verifyEmail } from '@/services/emailVerification';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim().max(254),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.safeParse(body);

    if (!validatedData.success) {
      // Audit log validation failure
      const context = extractSecurityContext(request);
      logSecurityEvent({
        type: SecurityEventType.INPUT_VALIDATION_FAILED,
        ...context,
        details: { endpoint: '/api/verify-email', errors: validatedData.error.flatten() },
      });
      return ApiErrors.badRequest('Invalid email address', validatedData.error.flatten());
    }

    const { email } = validatedData.data;

    const verificationResult = await verifyEmail(email);

    return successResponse(verificationResult);
  } catch (error) {
    logger.error('Email verification error', error);
    return ApiErrors.internal('Internal server error during email verification', error);
  }
}

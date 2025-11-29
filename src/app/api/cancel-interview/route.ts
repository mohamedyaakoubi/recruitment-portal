// src/app/api/cancel-interview/route.ts
import { NextRequest } from 'next/server';
import { cancelInterview } from '@/services/interview';
import logger from '@/lib/logger';
import { cancelInterviewSchema } from '@/lib/validations';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { requireAdminAuth } from '@/lib/auth';
import { withCsrfProtection } from '@/lib/csrf-middleware';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';

export const POST = withCsrfProtection(async (request: NextRequest) => {
  // Require admin authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const validatedData = cancelInterviewSchema.safeParse(body);

    if (!validatedData.success) {
      return ApiErrors.badRequest('Validation failed', validatedData.error.flatten());
    }

    const { candidateId, reason } = validatedData.data;

    await cancelInterview(candidateId, reason || 'Cancelled by admin');

    // Log admin operation
    const context = extractSecurityContext(request);
    logSecurityEvent({
      type: SecurityEventType.ADMIN_INTERVIEW_CANCELLED,
      ...context,
      details: { candidateId, reason: reason || 'Cancelled by admin' },
    });

    return successResponse({ candidateId }, { message: 'Interview cancelled successfully' });
  } catch (error) {
    logger.error('Error cancelling interview', error);
    return ApiErrors.internal('Failed to cancel interview', error);
  }
});

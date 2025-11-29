import { NextRequest } from 'next/server';
import { updateCandidateStatus } from '@/services/candidate';
import logger from '@/lib/logger';
import { statusUpdateSchema } from '@/lib/validations';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { requireAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const validatedData = statusUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return ApiErrors.badRequest('Validation failed', validatedData.error.flatten());
    }

    const { candidateId, newStatus, interviewTimestampISO, calendarEventId, meetLink, duration } =
      validatedData.data;

    // 🔥 UPDATED: Get email status from service
    const result = await updateCandidateStatus(
      candidateId,
      newStatus,
      interviewTimestampISO,
      calendarEventId,
      meetLink,
      duration
    );

    return successResponse({
      newStatus: result.status,
      emailSent: result.emailSent, // 🔥 NEW: Include email status
    });
  } catch (error) {
    logger.error('Error in /api/update-status', error);
    return ApiErrors.internal('Failed to update candidate status', error);
  }
}

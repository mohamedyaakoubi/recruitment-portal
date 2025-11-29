// src/app/api/schedule-interview-meet/route.ts
import { NextRequest } from 'next/server';
import { scheduleInterview } from '@/services/interview';
import logger from '@/lib/logger';
import { scheduleInterviewSchema } from '@/lib/validations';
import { successResponse, ApiErrors } from '@/lib/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = scheduleInterviewSchema.safeParse(body);

    if (!validatedData.success) {
      return ApiErrors.badRequest('Validation failed', validatedData.error.flatten());
    }

    const {
      candidateId,
      candidateEmail,
      candidateName,
      interviewDate,
      interviewTime,
      duration,
      jobTitle,
      adminEmail,
      notes,
    } = validatedData.data;

    const data = await scheduleInterview(
      candidateId,
      candidateEmail,
      candidateName,
      interviewDate,
      interviewTime,
      duration,
      jobTitle || '',
      adminEmail,
      notes || '',
      request.nextUrl.origin
    );

    return successResponse(data, { message: 'Interview scheduled successfully with Google Meet' });
  } catch (error) {
    logger.error('Error scheduling interview', error);
    return ApiErrors.internal('Failed to schedule interview', error);
  }
}

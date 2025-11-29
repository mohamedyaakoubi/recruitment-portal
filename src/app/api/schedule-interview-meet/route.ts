// src/app/api/schedule-interview-meet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scheduleInterview } from '@/services/interview';
import logger from '@/lib/logger';
import { scheduleInterviewSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = scheduleInterviewSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validatedData.error.flatten() },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: 'Interview scheduled successfully with Google Meet',
      data,
    });
  } catch (error) {
    logger.error('Error scheduling interview', error);
    return NextResponse.json(
      {
        error: 'Failed to schedule interview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

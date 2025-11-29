// src/app/api/cancel-interview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cancelInterview } from '@/services/interview';
import logger from '@/lib/logger';
import { cancelInterviewSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = cancelInterviewSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const { candidateId, reason } = validatedData.data;

    await cancelInterview(candidateId, reason || 'Cancelled by admin');

    return NextResponse.json({
      success: true,
      message: 'Interview cancelled successfully',
    });
  } catch (error) {
    logger.error('Error cancelling interview', error);
    return NextResponse.json(
      {
        error: 'Failed to cancel interview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

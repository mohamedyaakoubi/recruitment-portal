// src/app/api/cancel-interview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cancelInterview } from '@/services/interview';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { candidateId, reason = 'Cancelled by admin' } = await request.json();

    await cancelInterview(candidateId, reason);

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

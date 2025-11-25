// src/app/api/schedule-interview-meet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scheduleInterview } from '@/services/interview';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { 
      candidateId, 
      candidateEmail, 
      candidateName, 
      interviewDate, 
      interviewTime, 
      duration = 30,
      jobTitle, 
      adminEmail,
      notes 
    } = await request.json();

    const data = await scheduleInterview(
      candidateId,
      candidateEmail,
      candidateName,
      interviewDate,
      interviewTime,
      duration,
      jobTitle,
      adminEmail,
      notes,
      request.nextUrl.origin
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Interview scheduled successfully with Google Meet',
      data
    });

  } catch (error) {
    logger.error('Error scheduling interview', error);
    return NextResponse.json(
      { 
        error: 'Failed to schedule interview', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

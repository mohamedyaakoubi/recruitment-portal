import { NextRequest, NextResponse } from 'next/server';
import { updateCandidateStatus } from '@/services/candidate';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const { 
            candidateId, 
            newStatus, 
            interviewTimestampISO,
            calendarEventId,
            meetLink,
            duration
        } = await request.json();

        if (!candidateId || !newStatus) {
            return NextResponse.json({ error: 'Missing candidateId or newStatus' }, { status: 400 });
        }

        // 🔥 UPDATED: Get email status from service
        const result = await updateCandidateStatus(
            candidateId, 
            newStatus, 
            interviewTimestampISO,
            calendarEventId,
            meetLink,
            duration
        );

        return NextResponse.json({ 
            success: true, 
            newStatus: result.status,
            emailSent: result.emailSent // 🔥 NEW: Include email status
        });

    } catch (error) {
        logger.error('Error in /api/update-status', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ 
            error: 'Failed to update candidate status', 
            details: errorMessage 
        }, { status: 500 });
    }
}
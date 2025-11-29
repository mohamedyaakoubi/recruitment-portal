import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { calculateAge } from '@/lib/dateUtils';
import logger from '@/lib/logger';
import { updateCandidateSchema } from '@/lib/validations';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, updatedData } = body;

    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return NextResponse.json({ error: 'Updated data is required' }, { status: 400 });
    }

    // Validate updatedData against the schema
    const validatedData = updateCandidateSchema.safeParse(updatedData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const validUpdates = validatedData.data;

    logger.info('Updating candidate', { candidateId, fields: Object.keys(validUpdates) });

    const db = getFirestoreAdmin();
    const candidateRef = db.collection('candidates').doc(candidateId);

    // Check if candidate exists
    const candidateSnap = await candidateRef.get();
    if (!candidateSnap.exists) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Prepare update data with timestamp
    const updatePayload: Record<string, unknown> = {
      ...validUpdates,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Calculate age if dateOfBirth is being updated
    if (validUpdates.dateOfBirth) {
      const age = calculateAge(validUpdates.dateOfBirth);
      if (age !== null) {
        updatePayload.age = age;
      }
    }

    // Update the candidate
    await candidateRef.update(updatePayload);

    logger.info('Successfully updated candidate', { candidateId });

    return NextResponse.json({
      success: true,
      message: 'Candidate updated successfully',
      candidateId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Update candidate error', error);
    return NextResponse.json(
      {
        error: 'Failed to update candidate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

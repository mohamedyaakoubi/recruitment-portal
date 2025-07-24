import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { calculateAge } from '@/lib/dateUtils';

export async function PUT(request: NextRequest) {
  try {
    const { candidateId, updatedData } = await request.json();

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return NextResponse.json(
        { error: 'Updated data is required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating candidate ${candidateId} with data:`, updatedData);

    const db = getFirestoreAdmin();
    const candidateRef = db.collection('candidates').doc(candidateId);

    // Check if candidate exists
    const candidateSnap = await candidateRef.get();
    if (!candidateSnap.exists) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Prepare update data with timestamp
    const updatePayload: any = {
      ...updatedData,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    // Calculate age if dateOfBirth is being updated
    if (updatedData.dateOfBirth) {
      const age = calculateAge(updatedData.dateOfBirth);
      if (age !== null) {
        updatePayload.age = age;
      }
    }

    // Update the candidate
    await candidateRef.update(updatePayload);

    console.log(`✅ Successfully updated candidate ${candidateId}`);

    return NextResponse.json({
      success: true,
      message: 'Candidate updated successfully',
      candidateId,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Update candidate error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update candidate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
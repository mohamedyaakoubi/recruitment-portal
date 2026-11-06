import { NextRequest } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { calculateAge } from '@/lib/dateUtils';
import logger from '@/lib/logger';
import { updateCandidateSchema } from '@/lib/validations';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { requireAdminAuth } from '@/lib/auth';
import { withCsrfProtection } from '@/lib/csrf-middleware';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';

export const PUT = withCsrfProtection(async (request: NextRequest) => {
  // Require admin authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { candidateId, updatedData } = body;

    if (!candidateId) {
      return ApiErrors.badRequest('Candidate ID is required');
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return ApiErrors.badRequest('Updated data is required');
    }

    // Validate updatedData against the schema
    const validatedData = updateCandidateSchema.safeParse(updatedData);

    if (!validatedData.success) {
      return ApiErrors.badRequest('Validation failed', validatedData.error.flatten());
    }

    const validUpdates = validatedData.data;

    logger.info('Updating candidate', { candidateId, fields: Object.keys(validUpdates) });

    const db = getFirestoreAdmin();
    const candidateRef = db.collection('candidates').doc(candidateId);

    // Check if candidate exists
    const candidateSnap = await candidateRef.get();
    if (!candidateSnap.exists) {
      return ApiErrors.notFound('Candidate not found');
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

    // Log admin operation
    const context = extractSecurityContext(request);
    logSecurityEvent({
      type: SecurityEventType.ADMIN_CANDIDATE_UPDATED,
      ...context,
      details: { candidateId, updatedFields: Object.keys(validUpdates) },
    });

    return successResponse(
      {
        candidateId,
        updatedAt: new Date().toISOString(),
      },
      { message: 'Candidate updated successfully' }
    );
  } catch (error) {
    logger.error('Update candidate error', error);
    return ApiErrors.internal('Failed to update candidate', error);
  }
});

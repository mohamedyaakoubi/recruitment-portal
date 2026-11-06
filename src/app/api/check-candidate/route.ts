import { NextRequest } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import { z } from 'zod';

const checkCandidateSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim().max(254),
});

interface CandidateData {
  id: string;
  submittedAt: string | null;
  interviewDate: string | null;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = checkCandidateSchema.safeParse(body);

    if (!validatedData.success) {
      // Audit log validation failure
      const context = extractSecurityContext(request);
      logSecurityEvent({
        type: SecurityEventType.INPUT_VALIDATION_FAILED,
        ...context,
        details: { endpoint: '/api/check-candidate', errors: validatedData.error.flatten() },
      });
      return ApiErrors.badRequest('Invalid email address', validatedData.error.flatten());
    }

    const { email } = validatedData.data;

    logger.info('Checking database for email', { email });

    const db = getFirestoreAdmin();

    // 🔥 Optimized: Only query for this specific email (faster and cheaper)
    const candidatesRef = db.collection('candidates');
    const snapshot = await candidatesRef.where('email', '==', email).get();

    const exists = !snapshot.empty;
    const applications: CandidateData[] = [];

    if (exists) {
      logger.info('Found existing candidate in database');
      snapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate?.()?.toISOString() || null,
          interviewDate: data.interviewDate?.toDate?.()?.toISOString() || null,
        });
      });
    } else {
      logger.info('No existing candidate found - will need email verification');
    }

    return successResponse({
      exists,
      applications,
      count: applications.length,
    });
  } catch (error) {
    logger.error('Check candidate error', error);
    return ApiErrors.internal('Internal server error while checking candidate', error);
  }
}

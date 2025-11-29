import { NextRequest } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';

interface CandidateData {
  id: string;
  submittedAt: string | null;
  interviewDate: string | null;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return ApiErrors.badRequest('Email is required');
    }

    const searchEmail = email.toLowerCase().trim();
    logger.info('Checking database for email', { email: searchEmail });

    const db = getFirestoreAdmin();

    // 🔥 Optimized: Only query for this specific email (faster and cheaper)
    const candidatesRef = db.collection('candidates');
    const snapshot = await candidatesRef.where('email', '==', searchEmail).get();

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

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import logger from '@/lib/logger';

interface CandidateData {
  id: string;
  submittedAt: string | null;
  interviewDate: string | null;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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

    return NextResponse.json({
      exists,
      applications,
      count: applications.length,
    });
  } catch (error) {
    logger.error('Check candidate error', error);
    return NextResponse.json(
      { error: 'Internal server error while checking candidate' },
      { status: 500 }
    );
  }
}

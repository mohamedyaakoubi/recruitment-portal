import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import logger from '@/lib/logger';

interface CandidateApplication {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  gender?: string;
  phoneNumber?: string;
  countryCode?: string;
  dateOfBirth?: string;
  city?: string;
  country?: string;
  nationality?: string;
  doubleNationality?: string;
  jobTitle?: string;
  jobTitleText: string;
  jobCategory: string;
  specialty: string;
  websites?: string[];
  status: string;
  score: number | null;
  scoreAnalysis?: string;
  cvUrl: string;
  passportUrl: string;
  photoUrl: string;
  submittedAt: Date | null;
  interviewDate: Date | null;
  meetLink: string;
  calendarEventId?: string;
  duration?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const searchEmail = email.toLowerCase().trim();
    logger.info('Fetching applications for email', { email: searchEmail });

    const db = getFirestoreAdmin();
    const candidatesRef = db.collection('candidates');

    // Get all applications for this email, ordered by submission date (newest first)
    const snapshot = await candidatesRef
      .where('email', '==', searchEmail)
      .orderBy('submittedAt', 'desc')
      .get();

    const applications: CandidateApplication[] = [];

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        const data = doc.data();

        // Convert Firestore data to JavaScript objects
        const application: CandidateApplication = {
          id: doc.id,
          fullName: data.fullName || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          gender: data.gender || '',
          phoneNumber: data.phoneNumber || '',
          countryCode: data.countryCode || '',
          dateOfBirth: data.dateOfBirth || '',
          city: data.city || '',
          country: data.country || '',
          nationality: data.nationality || '',
          doubleNationality: data.doubleNationality || '',
          jobTitle: data.jobTitle || '',
          jobTitleText: data.jobTitleText || '',
          jobCategory: data.jobCategory || '',
          specialty: data.specialty || '',
          websites: data.websites || [],
          cvUrl: data.cvUrl || '',
          passportUrl: data.passportUrl || '',
          photoUrl: data.photoUrl || '',
          status: data.status || 'submitted',
          score: data.score || null,
          scoreAnalysis: data.scoreAnalysis || '',
          submittedAt: data.submittedAt ? data.submittedAt.toDate().toISOString() : null,
          interviewDate: data.interviewDate ? data.interviewDate.toDate().toISOString() : null,
          meetLink: data.meetLink || '',
          calendarEventId: data.calendarEventId || '',
          duration: data.duration || null,
        };

        applications.push(application);
      });
    }

    logger.info('Found applications', { count: applications.length, email: searchEmail });

    return NextResponse.json({
      applications,
      count: applications.length,
    });
  } catch (error) {
    logger.error('Get candidate applications error', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching applications' },
      { status: 500 }
    );
  }
}

import { NextRequest } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import { z } from 'zod';

const getCandidateSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim().max(254),
});

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
    const body = await request.json();
    const validatedData = getCandidateSchema.safeParse(body);

    if (!validatedData.success) {
      // Audit log validation failure
      const context = extractSecurityContext(request);
      logSecurityEvent({
        type: SecurityEventType.INPUT_VALIDATION_FAILED,
        ...context,
        details: {
          endpoint: '/api/get-candidate-applications',
          errors: validatedData.error.flatten(),
        },
      });
      return ApiErrors.badRequest('Invalid email address', validatedData.error.flatten());
    }

    const { email } = validatedData.data;

    logger.info('Fetching applications for email', { email });

    const db = getFirestoreAdmin();
    const candidatesRef = db.collection('candidates');

    // Get all applications for this email, ordered by submission date (newest first)
    const snapshot = await candidatesRef
      .where('email', '==', email)
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

    logger.info('Found applications', { count: applications.length, email });

    return successResponse({
      applications,
      count: applications.length,
    });
  } catch (error) {
    logger.error('Get candidate applications error', error);
    return ApiErrors.internal('Internal server error while fetching applications', error);
  }
}

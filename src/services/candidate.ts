import { getFirestoreAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { FieldValue, Query, DocumentData } from 'firebase-admin/firestore';
import { sendNotificationEmail, sendRejectionEmail } from './email';
import { format } from 'date-fns';
import logger from '@/lib/logger';
import { CANDIDATE_STATUSES } from '@/lib/constants';
import { calculateAge } from '@/lib/utils';

export const updateCandidateStatus = async (
  candidateId: string,
  newStatus: string,
  interviewTimestampISO?: string,
  calendarEventId?: string,
  meetLink?: string,
  duration?: number
): Promise<{ status: string; emailSent?: boolean }> => {
  const db = getFirestoreAdmin();

  // Use constant for validation
  if (!CANDIDATE_STATUSES.includes(newStatus as (typeof CANDIDATE_STATUSES)[number])) {
    throw new Error('Invalid status provided');
  }

  const candidateRef = db.collection('candidates').doc(candidateId);
  const candidateSnap = await candidateRef.get();

  if (!candidateSnap.exists) {
    throw new Error('Candidate not found');
  }

  const candidateData = candidateSnap.data();
  if (!candidateData) {
    throw new Error('Candidate data not found');
  }

  const updateData: {
    status: string;
    interviewDate?: admin.firestore.Timestamp | FieldValue;
    calendarEventId?: string | FieldValue;
    meetLink?: string | FieldValue;
    duration?: number | FieldValue;
  } = {
    status: newStatus,
  };

  let interviewDate: Date | undefined = undefined;
  if (newStatus === 'interview_scheduled') {
    if (!interviewTimestampISO) {
      throw new Error('Interview date and time are required for scheduling.');
    }
    try {
      interviewDate = new Date(interviewTimestampISO);
      if (isNaN(interviewDate.getTime())) {
        throw new Error('Invalid date format');
      }
      updateData.interviewDate = admin.firestore.Timestamp.fromDate(interviewDate);

      if (calendarEventId) updateData.calendarEventId = calendarEventId;
      if (meetLink) updateData.meetLink = meetLink;
      if (duration) updateData.duration = duration;
    } catch (dateError) {
      logger.error('Invalid interview date format received', dateError, { interviewTimestampISO });
      throw new Error('Invalid interview date format provided. Please use ISO format.');
    }
  } else {
    if (candidateData.status === 'interview_scheduled') {
      updateData.interviewDate = admin.firestore.FieldValue.delete();
      updateData.calendarEventId = admin.firestore.FieldValue.delete();
      updateData.meetLink = admin.firestore.FieldValue.delete();
      updateData.duration = admin.firestore.FieldValue.delete();
    }
  }

  // 🔥 UPDATED: Update database first
  await candidateRef.update(updateData);

  let emailSent = false;

  // 🔥 UPDATED: Handle email sending with proper error handling
  if (candidateData.email) {
    try {
      if (newStatus === 'rejected') {
        logger.info('Sending rejection email', { email: candidateData.email });
        await sendRejectionEmail(
          candidateData.email,
          candidateData.fullName || 'Candidate',
          candidateData.jobTitleText || ''
        );
        logger.info('Rejection email sent successfully', { email: candidateData.email });
        emailSent = true;
      } else if (newStatus === 'interview_scheduled' && interviewDate) {
        logger.info('Sending interview notification', { email: candidateData.email });
        await sendNotificationEmail(
          candidateData.email,
          newStatus,
          candidateData.fullName || 'Candidate',
          interviewDate
        );
        logger.info('Interview notification sent successfully', { email: candidateData.email });
        emailSent = true;
      }
    } catch (emailError) {
      logger.error('Failed to send email', emailError, { email: candidateData.email });
      // Don't throw error - status update was successful, just email failed
      emailSent = false;
    }
  }

  return { status: newStatus, emailSent };
};

// Rest of the exportCandidates function remains the same...
export const exportCandidates = async (
  filterStatus: string,
  filterName: string,
  filterNationality: string,
  filterCity: string = '',
  filterCountry: string = '',
  filterJobTitle: string = '',
  filterCategory: string = '',
  filterSpecialty: string = '',
  filterAgeMin: string = '',
  filterAgeMax: string = ''
) => {
  const db = getFirestoreAdmin();
  let query: Query<DocumentData> = db.collection('candidates');

  if (filterStatus !== 'all') {
    query = query.where('status', '==', filterStatus);
  }

  const snapshot = await query.orderBy('submittedAt', 'desc').get();

  let candidates = snapshot.docs.map((doc) => {
    const data = doc.data();
    const age = calculateAge(data.dateOfBirth);

    return {
      id: doc.id,
      fullName: data.fullName || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      gender: data.gender || '',
      phoneNumber: data.phoneNumber || '',
      countryCode: data.countryCode || '',
      dateOfBirth: data.dateOfBirth || '',
      age: age ?? undefined,
      city: data.city || '',
      country: data.country || '',
      nationality: data.nationality || '',
      doubleNationality: data.doubleNationality || '',
      jobTitle: data.jobTitle || '',
      jobTitleText: data.jobTitleText || '',
      jobCategory: data.jobCategory || '',
      specialty: data.specialty || '',
      websites: Array.isArray(data.websites) ? data.websites : [],
      status: data.status || '',
      score: data.score || null,
      scoreAnalysis: data.scoreAnalysis || '',
      submittedAt: data.submittedAt ? format(data.submittedAt.toDate(), 'yyyy-MM-dd HH:mm:ss') : '',
      interviewDate: data.interviewDate
        ? format(data.interviewDate.toDate(), 'yyyy-MM-dd HH:mm:ss')
        : '',
      meetLink: data.meetLink || '',
      calendarEventId: data.calendarEventId || '',
      meetSpaceId: data.meetSpaceId || '',
      duration: data.duration || '',
      cvUrl: data.cvUrl || '',
      passportUrl: data.passportUrl || '',
      photoUrl: data.photoUrl || '',
      applicationSource: data.applicationSource || 'web_form',
      lastUpdated: data.lastUpdated ? format(data.lastUpdated.toDate(), 'yyyy-MM-dd HH:mm:ss') : '',
      lastScoredAt: data.lastScoredAt
        ? format(data.lastScoredAt.toDate(), 'yyyy-MM-dd HH:mm:ss')
        : '',
    };
  });

  // Optimize: Combine all filters into a single pass instead of chaining multiple filter operations
  candidates = candidates.filter((candidate) => {
    // Filter by name
    if (filterName) {
      const nameLower = filterName.toLowerCase();
      const matchesName =
        candidate.fullName.toLowerCase().includes(nameLower) ||
        candidate.firstName.toLowerCase().includes(nameLower) ||
        candidate.lastName.toLowerCase().includes(nameLower);
      if (!matchesName) return false;
    }

    // Filter by nationality
    if (filterNationality) {
      const nationalityLower = filterNationality.toLowerCase();
      const matchesNationality =
        candidate.nationality.toLowerCase().includes(nationalityLower) ||
        candidate.doubleNationality.toLowerCase().includes(nationalityLower);
      if (!matchesNationality) return false;
    }

    // Filter by city
    if (filterCity) {
      if (!candidate.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
    }

    // Filter by country
    if (filterCountry) {
      if (!candidate.country.toLowerCase().includes(filterCountry.toLowerCase())) return false;
    }

    // Filter by job title
    if (filterJobTitle) {
      const jobTitleLower = filterJobTitle.toLowerCase();
      const matchesJobTitle =
        candidate.jobTitleText.toLowerCase().includes(jobTitleLower) ||
        candidate.jobTitle.toLowerCase().includes(jobTitleLower);
      if (!matchesJobTitle) return false;
    }

    // Filter by category
    if (filterCategory) {
      if (!candidate.jobCategory.toLowerCase().includes(filterCategory.toLowerCase())) return false;
    }

    // Filter by specialty
    if (filterSpecialty) {
      if (!candidate.specialty.toLowerCase().includes(filterSpecialty.toLowerCase())) return false;
    }

    // Filter by age
    if (filterAgeMin || filterAgeMax) {
      const candidateAge = candidate.age;
      if (!candidateAge && candidateAge !== 0) return false;

      const age = typeof candidateAge === 'string' ? parseInt(candidateAge) : candidateAge;
      if (isNaN(age)) return false;

      if (filterAgeMin && age < parseInt(filterAgeMin)) return false;
      if (filterAgeMax && age > parseInt(filterAgeMax)) return false;
    }

    return true;
  });

  return candidates;
};

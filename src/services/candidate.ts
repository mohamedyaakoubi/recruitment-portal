import { getFirestoreAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { FieldValue, Query, DocumentData } from 'firebase-admin/firestore';
import { sendNotificationEmail, sendRejectionEmail } from './email';
import { format } from 'date-fns';
import logger from '@/lib/logger';

// 🔥 NEW: Helper function to calculate age
export const calculateAge = (dateOfBirth: string): number | null => {
  if (!dateOfBirth) return null;

  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    // Check if date is valid
    if (isNaN(birthDate.getTime())) return null;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // If birth month hasn't occurred this year, or it's the birth month but the day hasn't occurred
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  } catch {
    return null;
  }
};

export const updateCandidateStatus = async (
  candidateId: string,
  newStatus: string,
  interviewTimestampISO?: string,
  calendarEventId?: string,
  meetLink?: string,
  duration?: number
): Promise<{ status: string; emailSent?: boolean }> => {
  const db = getFirestoreAdmin();
  const validStatuses = ['submitted', 'rejected', 'interview_scheduled', 'approved'];
  if (!validStatuses.includes(newStatus)) {
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

  // Apply all filters...
  if (filterName) {
    candidates = candidates.filter(
      (candidate) =>
        candidate.fullName.toLowerCase().includes(filterName.toLowerCase()) ||
        candidate.firstName.toLowerCase().includes(filterName.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(filterName.toLowerCase())
    );
  }

  if (filterNationality) {
    candidates = candidates.filter(
      (candidate) =>
        candidate.nationality.toLowerCase().includes(filterNationality.toLowerCase()) ||
        candidate.doubleNationality.toLowerCase().includes(filterNationality.toLowerCase())
    );
  }

  if (filterCity) {
    candidates = candidates.filter((candidate) =>
      candidate.city.toLowerCase().includes(filterCity.toLowerCase())
    );
  }

  if (filterCountry) {
    candidates = candidates.filter((candidate) =>
      candidate.country.toLowerCase().includes(filterCountry.toLowerCase())
    );
  }

  if (filterJobTitle) {
    candidates = candidates.filter(
      (candidate) =>
        candidate.jobTitleText.toLowerCase().includes(filterJobTitle.toLowerCase()) ||
        candidate.jobTitle.toLowerCase().includes(filterJobTitle.toLowerCase())
    );
  }

  if (filterCategory) {
    candidates = candidates.filter((candidate) =>
      candidate.jobCategory.toLowerCase().includes(filterCategory.toLowerCase())
    );
  }

  if (filterSpecialty) {
    candidates = candidates.filter((candidate) =>
      candidate.specialty.toLowerCase().includes(filterSpecialty.toLowerCase())
    );
  }

  // Age filtering
  if (filterAgeMin || filterAgeMax) {
    candidates = candidates.filter((candidate) => {
      const candidateAge = candidate.age;
      if (!candidateAge && candidateAge !== 0) return false;

      const age = typeof candidateAge === 'string' ? parseInt(candidateAge) : candidateAge;
      if (isNaN(age)) return false;

      if (filterAgeMin && age < parseInt(filterAgeMin)) return false;
      if (filterAgeMax && age > parseInt(filterAgeMax)) return false;

      return true;
    });
  }

  return candidates;
};

// src/services/candidate.ts
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendNotificationEmail } from './email';
import { format } from 'date-fns';

export const updateCandidateStatus = async (
    candidateId: string, 
    newStatus: string, 
    interviewTimestampISO?: string,
    calendarEventId?: string,
    meetLink?: string,
    duration?: number
) => {
    const db = getFirestoreAdmin();
    const validStatuses = ['submitted', 'rejected', 'interview_scheduled', 'approved'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status provided');
    }

    const candidateRef = db.collection("candidates").doc(candidateId);
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
            console.error("Invalid interview date format received:", interviewTimestampISO, dateError);
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

    await candidateRef.update(updateData);

    if (candidateData.email && (newStatus === 'rejected' || (newStatus === 'interview_scheduled' && interviewDate))) {
        await sendNotificationEmail(candidateData.email, newStatus, candidateData.fullName || 'Candidate', interviewDate);
    }

    return newStatus;
};

export const exportCandidates = async (
    filterStatus: string,
    filterName: string,
    filterNationality: string
) => {
    const db = getFirestoreAdmin();
    let query: any = db.collection("candidates");

    if (filterStatus !== 'all') {
      query = query.where('status', '==', filterStatus);
    }

    const snapshot = await query.orderBy('submittedAt', 'desc').get();
    
    let candidates = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || '',
        email: data.email || '',
        gender: data.gender || '',
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: data.dateOfBirth || '',
        city: data.city || '',
        country: data.country || '',
        nationality: data.nationality || '',
        doubleNationality: data.doubleNationality || '',
        jobTitle: data.jobTitleText || '',
        websites: Array.isArray(data.websites) ? data.websites.join(', ') : '',
        status: data.status || '',
        score: data.score || null,
        scoreAnalysis: data.scoreAnalysis || '',
        submittedAt: data.submittedAt ? format(data.submittedAt.toDate(), 'yyyy-MM-dd HH:mm:ss') : '',
        interviewDate: data.interviewDate ? format(data.interviewDate.toDate(), 'yyyy-MM-dd HH:mm:ss') : '',
        cvUrl: data.cvUrl || '',
        passportUrl: data.passportUrl || '',
        photoUrl: data.photoUrl || ''
      };
    });

    if (filterName) {
      candidates = candidates.filter((candidate: any) => 
        candidate.fullName.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (filterNationality) {
      candidates = candidates.filter((candidate: any) => 
        candidate.nationality.toLowerCase().includes(filterNationality.toLowerCase())
      );
    }

    return candidates;
};

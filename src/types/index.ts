import { Timestamp } from 'firebase/firestore';

export interface Candidate {
    id: string;
    fullName: string;
    firstName?: string; // ✅ Added
    lastName?: string; // ✅ Added
    email: string;
    gender?: string; // ✅ Added
    phoneNumber?: string; // ✅ Added
    countryCode?: string; // ✅ Added
    dateOfBirth?: string;
    city?: string;
    country?: string;
    nationality?: string;
    doubleNationality?: string;
    jobTitle?: string; // ✅ Added (this is the job ID)
    jobTitleText?: string; // This is the human-readable job title
    jobCategory?: string;
    websites: string[];
    cvUrl: string;
    passportUrl: string;
    photoUrl?: string; // ✅ Made optional since photo upload is optional
    submittedAt: Timestamp;
    status: 'submitted' | 'rejected' | 'interview_scheduled' | 'approved' | string;
    score: number | null;
    scoreAnalysis?: string;
    lastScoredAt?: Timestamp;
    interviewDate?: Timestamp;
    // Google Meet integration fields
    calendarEventId?: string;
    meetLink?: string;
    meetSpaceId?: string;
    duration?: number;
}
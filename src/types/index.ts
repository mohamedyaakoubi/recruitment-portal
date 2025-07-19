import { Timestamp } from 'firebase/firestore';

export interface Candidate {
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
    jobTitleText?: string;
    jobCategory?: string;
    specialty?: string; // ✅ Add specialty field
    websites: string[];
    cvUrl: string;
    passportUrl: string;
    photoUrl?: string;
    submittedAt: Timestamp;
    status: 'submitted' | 'rejected' | 'interview_scheduled' | 'approved' | string;
    score: number | null;
    scoreAnalysis?: string;
    lastScoredAt?: Timestamp;
    interviewDate?: Timestamp;
    calendarEventId?: string;
    meetLink?: string;
    meetSpaceId?: string;
    duration?: number;
}
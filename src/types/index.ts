import { Timestamp } from 'firebase/firestore'; // ✅ Add this import

export interface Candidate {
    id: string;
    fullName: string;
    email: string;
    websites: string[];
    cvUrl: string;
    passportUrl: string;
    submittedAt: Timestamp;
    status: 'submitted' | 'rejected' | 'interview_scheduled' | 'approved' | string;
    score: number | null;
    scoreAnalysis?: string;
    lastScoredAt?: Timestamp;
    interviewDate?: Timestamp;
    city?: string;
    country?: string;
    jobTitleText?: string;
    dateOfBirth?: string;
    jobCategory?: string;
    // Google Meet integration fields
    calendarEventId?: string;
    meetLink?: string;
    meetSpaceId?: string;
    duration?: number;
}
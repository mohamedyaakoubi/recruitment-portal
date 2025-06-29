import type { Timestamp } from 'firebase/firestore';

export interface Candidate {
    id: string;
    fullName: string;
    email: string;
    websites: string[];
    cvUrl: string;
    passportUrl: string;
    submittedAt: Timestamp;
    status: 'submitted' | 'rejected' | 'interview_scheduled' | string;
    score: number | null;
    scoreAnalysis?: string;
    lastScoredAt?: Timestamp;
    interviewDate?: Timestamp;
    city?: string;
    country?: string;
    jobTitleText?: string;
    dateOfBirth?: string;
    jobCategory?: string;
}

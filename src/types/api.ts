// Standard API response wrapper
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Candidate API responses
export interface CheckCandidateResponse {
    exists: boolean;
    applications: CandidateApplication[];
    count: number;
}

export interface CandidateApplication {
    id: string;
    submittedAt: string | null;
    interviewDate: string | null;
    [key: string]: unknown;
}

export interface UpdateStatusResponse {
    success: boolean;
    newStatus: string;
    emailSent?: boolean;
}

export interface ScoreCandidateResponse {
    success: boolean;
    score: number;
    analysis: string;
    keyStrengths: string[];
    areasForImprovement: string[];
    recommendation: string;
    jobTitle: string;
    scoringVersion: string;
}

export interface ScheduleInterviewResponse {
    success: boolean;
    message: string;
    data: {
        interviewDateTime: string;
        endDateTime: string;
        duration: number;
        meetLink: string;
        calendarEventId: string;
        emailsSent: {
            candidate: string;
            interviewer: string;
        };
    };
}

// Email verification response
export interface EmailVerificationResponse {
    isValid: boolean;
    deliverable?: boolean;
    disposable?: boolean;
    role_account?: boolean;
    error?: string;
}

// Phone validation response
export interface PhoneValidationResponse {
    isValid: boolean;
    message?: string;
    warning?: string;
    country?: {
        name: string;
        code: string;
    };
    type?: string;
    carrier?: string;
}

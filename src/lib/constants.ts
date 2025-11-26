// Application constants
export const APP_NAME = 'International Skills Labor Company';
export const APP_EMAIL = 'wassim@internationalskills.fi';
export const APP_PHONE = '+358 452644966';

// Status values
export const CANDIDATE_STATUSES = {
  SUBMITTED: 'submitted',
  REJECTED: 'rejected',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  APPROVED: 'approved',
} as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[keyof typeof CANDIDATE_STATUSES];

// Status display labels
export const STATUS_LABELS: Record<CandidateStatus, string> = {
  [CANDIDATE_STATUSES.SUBMITTED]: 'Submitted',
  [CANDIDATE_STATUSES.REJECTED]: 'Rejected',
  [CANDIDATE_STATUSES.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
  [CANDIDATE_STATUSES.APPROVED]: 'Approved',
};

// Status colors for UI
export const STATUS_COLORS: Record<CandidateStatus, { bg: string; text: string }> = {
  [CANDIDATE_STATUSES.SUBMITTED]: { bg: 'bg-blue-100', text: 'text-blue-800' },
  [CANDIDATE_STATUSES.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' },
  [CANDIDATE_STATUSES.INTERVIEW_SCHEDULED]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [CANDIDATE_STATUSES.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
};

// File upload limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_CV_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_PASSPORT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
};

// Interview settings
export const INTERVIEW_DEFAULTS = {
  DURATION_OPTIONS: [15, 30, 45, 60, 90, 120],
  DEFAULT_DURATION: 30,
  MIN_DURATION: 15,
  MAX_DURATION: 180,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
};

// Age limits
export const AGE_LIMITS = {
  MIN_AGE: 18,
  MAX_AGE: 100,
};

// Rate limiting
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  EMAIL_VERIFICATION_PER_HOUR: 10,
  FORM_SUBMISSIONS_PER_HOUR: 5,
};

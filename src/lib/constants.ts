// Candidate statuses
export const CANDIDATE_STATUSES = [
  'submitted',
  'rejected',
  'interview_scheduled',
  'approved',
] as const;
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

// AI recommendation values
export const AI_RECOMMENDATIONS = [
  'highly_recommended',
  'recommended',
  'conditional',
  'not_recommended',
] as const;
export type AIRecommendation = (typeof AI_RECOMMENDATIONS)[number];

// Rate limiting (legacy - moved to rate-limit.ts)
export const RATE_LIMITS = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 60,
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_CV_SIZE_MB: 5,
  MAX_PHOTO_SIZE_MB: 2,
  MAX_PASSPORT_SIZE_MB: 5,
  ALLOWED_CV_TYPES: ['.pdf', '.doc', '.docx'] as const,
  ALLOWED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png'] as const,
  ALLOWED_PASSPORT_TYPES: ['.pdf', '.jpg', '.jpeg', '.png'] as const,
} as const;

// Request size limits
export const REQUEST_LIMITS = {
  MAX_JSON_SIZE_BYTES: 1024 * 1024, // 1 MB
  MAX_FORM_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB (for file uploads)
  MAX_REQUEST_TIMEOUT_MS: 30000, // 30 seconds
} as const;

// Interview defaults
export const INTERVIEW_DEFAULTS = {
  MIN_DURATION: 15,
  MAX_DURATION: 180,
  DEFAULT_DURATION: 30,
} as const;

// Application limits
export const APPLICATION_LIMITS = {
  MAX_PER_CATEGORY_PER_MONTH: 3,
  COOLDOWN_MONTHS_SAME_JOB: 6,
} as const;

// Scoring
export const SCORING = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  VERSION: 'gemini-2.5-pro-enhanced',
} as const;

// Security configuration
export const SECURITY_CONFIG = {
  SESSION_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  CSRF_TOKEN_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
} as const;

// Re-export constants from submodules for convenience
export { ERROR_MESSAGES } from './constants/errors';
export type { ErrorMessageKey } from './constants/errors';
export { EMAIL_ADDRESSES } from './constants/emails';
export type { EmailAddress } from './constants/emails';

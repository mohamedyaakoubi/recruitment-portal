// Error message constants for consistent API responses

export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH_REQUIRED: 'Authentication required',
  AUTH_INVALID: 'Invalid authentication credentials',
  AUTH_EXPIRED: 'Authentication token has expired',
  FORBIDDEN: 'You do not have permission to access this resource',

  // Validation errors
  VALIDATION_FAILED: 'Validation failed',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_FORMAT: 'Invalid format',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_DATE: 'Invalid date format',

  // Resource errors
  NOT_FOUND: 'Resource not found',
  CANDIDATE_NOT_FOUND: 'Candidate not found',
  JOB_NOT_FOUND: 'Job not found',
  ALREADY_EXISTS: 'Resource already exists',

  // Operation errors
  OPERATION_FAILED: 'Operation failed',
  UPDATE_FAILED: 'Failed to update resource',
  DELETE_FAILED: 'Failed to delete resource',
  CREATE_FAILED: 'Failed to create resource',

  // External service errors
  EMAIL_SEND_FAILED: 'Failed to send email',
  EMAIL_VERIFICATION_FAILED: 'Email verification failed',
  PHONE_VALIDATION_FAILED: 'Phone validation failed',
  AI_SCORING_UNAVAILABLE: 'AI scoring service is unavailable',
  CALENDAR_SERVICE_UNAVAILABLE: 'Calendar service is unavailable',

  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds maximum allowed',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_UPLOAD_FAILED: 'File upload failed',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',

  // Server errors
  INTERNAL_ERROR: 'An internal server error occurred',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

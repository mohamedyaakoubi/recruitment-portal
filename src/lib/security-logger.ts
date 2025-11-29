/**
 * Security Event Logger
 * Provides structured logging for security-related events
 */

import logger from './logger';
import { sendSecurityAlert, AlertSeverity } from './securityAlerts';

export enum SecurityEventType {
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  AUTH_INVALID_TOKEN = 'auth_invalid_token',
  AUTH_EXPIRED_TOKEN = 'auth_expired_token',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_VALIDATION_FAILED = 'csrf_validation_failed',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  INPUT_VALIDATION_FAILED = 'input_validation_failed',
  SESSION_CREATED = 'session_created',
  SESSION_DESTROYED = 'session_destroyed',
  // Admin operations audit events
  ADMIN_JOB_CREATED = 'admin_job_created',
  ADMIN_JOB_UPDATED = 'admin_job_updated',
  ADMIN_JOB_DELETED = 'admin_job_deleted',
  ADMIN_CANDIDATE_UPDATED = 'admin_candidate_updated',
  ADMIN_CANDIDATE_SCORED = 'admin_candidate_scored',
  ADMIN_STATUS_CHANGED = 'admin_status_changed',
  ADMIN_INTERVIEW_SCHEDULED = 'admin_interview_scheduled',
  ADMIN_INTERVIEW_CANCELLED = 'admin_interview_cancelled',
  ADMIN_DATA_EXPORTED = 'admin_data_exported',
  ADMIN_EMAIL_SENT = 'admin_email_sent',
}

interface SecurityEventData {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  details?: Record<string, unknown>;
  correlationId?: string;
}

/**
 * Log a security event with structured data
 */
export function logSecurityEvent(data: SecurityEventData): void {
  const logData = {
    event: 'security',
    ...data,
    timestamp: new Date().toISOString(),
  };

  // Log at different levels based on severity
  switch (data.type) {
    case SecurityEventType.AUTH_FAILURE:
    case SecurityEventType.AUTH_INVALID_TOKEN:
    case SecurityEventType.RATE_LIMIT_EXCEEDED:
    case SecurityEventType.CSRF_VALIDATION_FAILED:
    case SecurityEventType.UNAUTHORIZED_ACCESS:
    case SecurityEventType.SUSPICIOUS_ACTIVITY:
      logger.warn('Security event', logData);

      // Send security alerts for critical/high severity events
      void sendSecurityAlert({
        eventType: data.type,
        severity:
          data.type === SecurityEventType.UNAUTHORIZED_ACCESS ||
          data.type === SecurityEventType.CSRF_VALIDATION_FAILED
            ? AlertSeverity.CRITICAL
            : AlertSeverity.HIGH,
        description: `Security event detected: ${data.type}`,
        userId: data.userId,
        ipAddress: data.ip,
        userAgent: data.userAgent,
        requestPath: data.path,
        requestMethod: data.method,
        additionalContext: data.details,
      });
      break;

    case SecurityEventType.AUTH_SUCCESS:
    case SecurityEventType.SESSION_CREATED:
    case SecurityEventType.SESSION_DESTROYED:
      logger.info('Security event', logData);
      break;

    default:
      logger.info('Security event', logData);
  }
}

/**
 * Extract security context from request
 */
export function extractSecurityContext(request: {
  headers: Headers;
  nextUrl: { pathname: string };
  method: string;
}): {
  ip: string;
  userAgent: string;
  path: string;
  method: string;
} {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? (forwarded.split(',')[0]?.trim() ?? 'unknown') : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return {
    ip,
    userAgent,
    path: request.nextUrl.pathname,
    method: request.method,
  };
}

/**
 * Generate a correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

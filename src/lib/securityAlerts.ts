/**
 * Security Alert Service
 * Sends real-time alerts for critical security events
 * Uses pattern detection to avoid spam for routine events
 */

import logger from './logger';

// Re-define event types here to avoid circular dependency with security-logger.ts
// These must match the SecurityEventType enum in security-logger.ts
const SecurityEventTypes = {
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  AUTH_FAILURE: 'auth_failure',
  INPUT_VALIDATION_FAILED: 'input_validation_failed',
  CSRF_VALIDATION_FAILED: 'csrf_validation_failed',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  AUTH_INVALID_TOKEN: 'auth_invalid_token',
} as const;

interface AlertConfig {
  webhookUrl?: string;
  email?: string;
  slackWebhook?: string;
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

interface SecurityAlert {
  severity: 'critical' | 'high' | 'medium' | 'low';
  eventType: string;
  message: string;
  details: Record<string, unknown>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

// ============================================
// Pattern Detection - Track violations per IP
// ============================================
interface ViolationRecord {
  count: number;
  firstSeen: number;
  lastSeen: number;
  alertSent: boolean;
}

// Store violation patterns per IP+eventType
const violationPatterns = new Map<string, ViolationRecord>();

// Thresholds for pattern detection
const PATTERN_THRESHOLDS: Record<string, { count: number; windowMs: number }> = {
  // Rate limit: alert after 10 violations in 5 minutes from same IP
  [SecurityEventTypes.RATE_LIMIT_EXCEEDED]: { count: 10, windowMs: 5 * 60 * 1000 },
  // Auth failures: alert after 5 failures in 10 minutes from same IP
  [SecurityEventTypes.AUTH_FAILURE]: { count: 5, windowMs: 10 * 60 * 1000 },
  // Input validation: alert after 20 failures in 5 minutes (potential fuzzing)
  [SecurityEventTypes.INPUT_VALIDATION_FAILED]: { count: 20, windowMs: 5 * 60 * 1000 },
};

// Events that should ALWAYS alert immediately (no pattern detection)
const IMMEDIATE_ALERT_EVENTS = new Set<string>([
  SecurityEventTypes.CSRF_VALIDATION_FAILED,
  SecurityEventTypes.UNAUTHORIZED_ACCESS,
  SecurityEventTypes.SUSPICIOUS_ACTIVITY,
  SecurityEventTypes.AUTH_INVALID_TOKEN,
]);

/**
 * Check if this violation forms a suspicious pattern
 */
function checkViolationPattern(
  eventType: string,
  ip: string | undefined
): { shouldAlert: boolean; patternDetails?: { count: number; windowMinutes: number } } {
  // Always alert for critical security events
  if (IMMEDIATE_ALERT_EVENTS.has(eventType)) {
    return { shouldAlert: true };
  }

  // Skip pattern tracking if no IP
  if (!ip) {
    return { shouldAlert: false };
  }

  // Get threshold for this event type
  const threshold = PATTERN_THRESHOLDS[eventType];
  if (!threshold) {
    // No threshold defined - don't alert for this event type
    return { shouldAlert: false };
  }

  const key = `${ip}:${eventType}`;
  const now = Date.now();
  const record = violationPatterns.get(key);

  if (!record || now - record.firstSeen > threshold.windowMs) {
    // Start new tracking window
    violationPatterns.set(key, {
      count: 1,
      firstSeen: now,
      lastSeen: now,
      alertSent: false,
    });
    return { shouldAlert: false };
  }

  // Update existing record
  record.count++;
  record.lastSeen = now;

  // Check if pattern threshold reached and alert not yet sent
  if (record.count >= threshold.count && !record.alertSent) {
    record.alertSent = true;
    return {
      shouldAlert: true,
      patternDetails: {
        count: record.count,
        windowMinutes: Math.round(threshold.windowMs / 60000),
      },
    };
  }

  return { shouldAlert: false };
}

/**
 * Clean up old violation records periodically
 */
function cleanupOldRecords(): void {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes

  for (const [key, record] of violationPatterns.entries()) {
    if (now - record.lastSeen > maxAge) {
      violationPatterns.delete(key);
    }
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldRecords, 10 * 60 * 1000);
}

interface SendAlertParams {
  eventType: string;
  severity: AlertSeverity;
  description: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;
  additionalContext?: Record<string, unknown>;
}

/**
 * Send security alert
 */
export async function sendSecurityAlert(params: SendAlertParams): Promise<void> {
  const severity = params.severity;

  // Skip alerts in development for non-critical events
  if (process.env.NODE_ENV === 'development' && severity !== AlertSeverity.CRITICAL) {
    // Still log locally, just don't send to Slack/webhooks
    logger.info('Security event (dev mode - not alerting)', {
      eventType: params.eventType,
      ip: params.ipAddress,
    });
    return;
  }

  // Check if this event forms a suspicious pattern worth alerting
  const patternCheck = checkViolationPattern(params.eventType, params.ipAddress);

  if (!patternCheck.shouldAlert) {
    // Log locally but don't send external alert
    logger.info('Security event tracked (no pattern detected yet)', {
      eventType: params.eventType,
      ip: params.ipAddress,
    });
    return;
  }

  // Build alert message with pattern info if available
  let alertMessage = params.description;
  if (patternCheck.patternDetails) {
    alertMessage = `🔥 PATTERN DETECTED: ${params.eventType} - ${patternCheck.patternDetails.count} violations from same IP in ${patternCheck.patternDetails.windowMinutes} minutes`;
  }

  const alert: SecurityAlert = {
    severity,
    eventType: params.eventType,
    message: alertMessage,
    details: {
      ...(params.additionalContext || {}),
      path: params.requestPath,
      method: params.requestMethod,
      userId: params.userId,
      environment: process.env.NODE_ENV || 'unknown',
      ...(patternCheck.patternDetails && {
        patternDetected: true,
        violationCount: patternCheck.patternDetails.count,
        windowMinutes: patternCheck.patternDetails.windowMinutes,
      }),
    },
    timestamp: new Date().toISOString(),
    ip: params.ipAddress,
    userAgent: params.userAgent,
  };

  // Log the alert
  logger.warn('Security Alert Triggered', {
    severity: alert.severity,
    eventType: alert.eventType,
    message: alert.message,
    timestamp: alert.timestamp,
    ip: alert.ip,
    details: alert.details,
  });

  // Send to configured channels
  const config = getAlertConfig();

  const promises: Promise<void>[] = [];

  if (config.slackWebhook) {
    promises.push(sendSlackAlert(config.slackWebhook, alert));
  }

  if (config.webhookUrl) {
    promises.push(sendWebhookAlert(config.webhookUrl, alert));
  }

  if (config.email) {
    promises.push(sendEmailAlert(config.email, alert));
  }

  // Send all alerts in parallel, don't wait for completion
  Promise.allSettled(promises).catch((error) => {
    logger.error('Failed to send security alerts', error);
  });
}

/**
 * Get alert configuration from environment
 */
function getAlertConfig(): AlertConfig {
  return {
    slackWebhook: process.env.SECURITY_ALERT_SLACK_WEBHOOK,
    webhookUrl: process.env.SECURITY_ALERT_WEBHOOK_URL,
    email: process.env.SECURITY_ALERT_EMAIL,
  };
}

/**
 * Send alert to Slack
 */
async function sendSlackAlert(webhookUrl: string, alert: SecurityAlert): Promise<void> {
  try {
    const color = {
      critical: '#dc2626', // red-600
      high: '#ea580c', // orange-600
      medium: '#ca8a04', // yellow-600
      low: '#2563eb', // blue-600
    }[alert.severity];

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [
          {
            color,
            title: `🚨 ${alert.severity.toUpperCase()} Security Alert`,
            text: alert.message,
            fields: [
              { title: 'Event Type', value: alert.eventType, short: true },
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'IP Address', value: alert.ip || 'unknown', short: true },
              { title: 'Timestamp', value: alert.timestamp, short: true },
              { title: 'Details', value: JSON.stringify(alert.details, null, 2), short: false },
            ],
            footer: 'Security Monitoring System',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  } catch (error) {
    logger.error('Failed to send Slack alert', error);
  }
}

/**
 * Send alert to generic webhook
 */
async function sendWebhookAlert(webhookUrl: string, alert: SecurityAlert): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }
  } catch (error) {
    logger.error('Failed to send webhook alert', error);
  }
}

/**
 * Send alert via email (placeholder - integrate with your email service)
 */
async function sendEmailAlert(email: string, alert: SecurityAlert): Promise<void> {
  try {
    // This is a placeholder - integrate with your email service (SendGrid, AWS SES, etc.)
    logger.info('Email alert would be sent to', { email, alert: alert.message });

    // Example integration:
    // await emailService.send({
    //   to: email,
    //   subject: `🚨 ${alert.severity.toUpperCase()} Security Alert: ${alert.eventType}`,
    //   body: JSON.stringify(alert, null, 2)
    // });
  } catch (error) {
    logger.error('Failed to send email alert', error);
  }
}

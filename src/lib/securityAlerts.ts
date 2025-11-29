/**
 * Security Alert Service
 * Sends real-time alerts for critical security events
 */

import logger from './logger';
import { SecurityEventType } from './security-logger';

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
  eventType: SecurityEventType;
  message: string;
  details: Record<string, unknown>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Check if event should trigger an alert
 */
function shouldAlert(eventType: SecurityEventType, severity: SecurityAlert['severity']): boolean {
  // Only alert on critical and high severity events by default
  if (severity === 'critical' || severity === 'high') {
    return true;
  }

  // In production, be more aggressive
  if (process.env.NODE_ENV === 'production' && severity === 'medium') {
    return true;
  }

  return false;
}

interface SendAlertParams {
  eventType: SecurityEventType;
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

  if (!shouldAlert(params.eventType, severity)) {
    return;
  }

  const alert: SecurityAlert = {
    severity,
    eventType: params.eventType,
    message: params.description,
    details: {
      ...(params.additionalContext || {}),
      path: params.requestPath,
      method: params.requestMethod,
      userId: params.userId,
      environment: process.env.NODE_ENV || 'unknown',
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

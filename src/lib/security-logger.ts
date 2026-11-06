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
  fingerprint?: AttackerFingerprint;
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
        fingerprint: data.fingerprint
          ? {
              network: {
                ip: data.fingerprint.network.ip,
                proxyChain: data.fingerprint.network.proxyChain,
                forwardedProto: data.fingerprint.network.forwardedProto,
                cfIpCountry: data.fingerprint.network.cfIpCountry,
              },
              client: {
                userAgent: data.fingerprint.client.userAgent,
                browser: data.fingerprint.client.browser,
                os: data.fingerprint.client.os,
                device: data.fingerprint.client.device,
                secChUaPlatform: data.fingerprint.client.secChUaPlatform,
              },
              request: {
                origin: data.fingerprint.request.origin,
                referer: data.fingerprint.request.referer,
                acceptLanguage: data.fingerprint.request.acceptLanguage,
              },
              anomalies: data.fingerprint.anomalies,
            }
          : undefined,
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
 * Captures comprehensive attacker fingerprint information
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
  fingerprint: AttackerFingerprint;
} {
  const headers = request.headers;

  // IP extraction with proxy chain detection
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  const ip =
    cfConnectingIp ||
    realIp ||
    (forwarded ? (forwarded.split(',')[0]?.trim() ?? 'unknown') : 'unknown');
  const proxyChain = forwarded ? forwarded.split(',').map((s) => s.trim()) : [];

  const userAgent = headers.get('user-agent') || 'unknown';

  // Build comprehensive fingerprint
  const fingerprint: AttackerFingerprint = {
    // Network information
    network: {
      ip,
      proxyChain: proxyChain.length > 1 ? proxyChain : undefined,
      forwardedProto: headers.get('x-forwarded-proto') || undefined,
      forwardedHost: headers.get('x-forwarded-host') || undefined,
      // Cloudflare headers (if using CF)
      cfRay: headers.get('cf-ray') || undefined,
      cfIpCountry: headers.get('cf-ipcountry') || undefined,
      cfVisitor: headers.get('cf-visitor') || undefined,
      // Connection info
      connection: headers.get('connection') || undefined,
      upgradeInsecureRequests: headers.get('upgrade-insecure-requests') || undefined,
    },

    // Browser/Client information
    client: {
      userAgent,
      // Parse user agent for quick reference
      browser: parseUserAgentBrowser(userAgent),
      os: parseUserAgentOS(userAgent),
      device: parseUserAgentDevice(userAgent),
      // Client hints (modern browsers)
      secChUa: headers.get('sec-ch-ua') || undefined,
      secChUaPlatform: headers.get('sec-ch-ua-platform') || undefined,
      secChUaMobile: headers.get('sec-ch-ua-mobile') || undefined,
      secChUaPlatformVersion: headers.get('sec-ch-ua-platform-version') || undefined,
      // Fetch metadata
      secFetchDest: headers.get('sec-fetch-dest') || undefined,
      secFetchMode: headers.get('sec-fetch-mode') || undefined,
      secFetchSite: headers.get('sec-fetch-site') || undefined,
      secFetchUser: headers.get('sec-fetch-user') || undefined,
    },

    // Request context
    request: {
      accept: headers.get('accept') || undefined,
      acceptLanguage: headers.get('accept-language') || undefined,
      acceptEncoding: headers.get('accept-encoding') || undefined,
      contentType: headers.get('content-type') || undefined,
      origin: headers.get('origin') || undefined,
      referer: headers.get('referer') || undefined,
      host: headers.get('host') || undefined,
      cacheControl: headers.get('cache-control') || undefined,
      pragma: headers.get('pragma') || undefined,
    },

    // Security indicators
    security: {
      // DNT (Do Not Track)
      dnt: headers.get('dnt') || undefined,
      // Authorization header present (redacted)
      hasAuthHeader: !!headers.get('authorization'),
      hasCookies: !!headers.get('cookie'),
      // CORS headers
      accessControlRequestMethod: headers.get('access-control-request-method') || undefined,
      accessControlRequestHeaders: headers.get('access-control-request-headers') || undefined,
    },

    // Anomaly detection flags
    anomalies: detectAnomalies(headers, userAgent),
  };

  return {
    ip,
    userAgent,
    path: request.nextUrl.pathname,
    method: request.method,
    fingerprint,
  };
}

/**
 * Attacker fingerprint with comprehensive information
 */
export interface AttackerFingerprint {
  network: {
    ip: string;
    proxyChain?: string[];
    forwardedProto?: string;
    forwardedHost?: string;
    cfRay?: string;
    cfIpCountry?: string;
    cfVisitor?: string;
    connection?: string;
    upgradeInsecureRequests?: string;
  };
  client: {
    userAgent: string;
    browser?: string;
    os?: string;
    device?: string;
    secChUa?: string;
    secChUaPlatform?: string;
    secChUaMobile?: string;
    secChUaPlatformVersion?: string;
    secFetchDest?: string;
    secFetchMode?: string;
    secFetchSite?: string;
    secFetchUser?: string;
  };
  request: {
    accept?: string;
    acceptLanguage?: string;
    acceptEncoding?: string;
    contentType?: string;
    origin?: string;
    referer?: string;
    host?: string;
    cacheControl?: string;
    pragma?: string;
  };
  security: {
    dnt?: string;
    hasAuthHeader: boolean;
    hasCookies: boolean;
    accessControlRequestMethod?: string;
    accessControlRequestHeaders?: string;
  };
  anomalies: string[];
}

/**
 * Parse browser from user agent
 */
function parseUserAgentBrowser(ua: string): string {
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Opera/') || ua.includes('OPR/')) return 'Opera';
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'IE';
  if (ua.includes('curl/')) return 'curl';
  if (ua.includes('python-requests')) return 'Python Requests';
  if (ua.includes('axios')) return 'Axios';
  if (ua.includes('PostmanRuntime')) return 'Postman';
  return 'Unknown';
}

/**
 * Parse OS from user agent
 */
function parseUserAgentOS(ua: string): string {
  if (ua.includes('Windows NT 10')) return 'Windows 10/11';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows NT 6.1')) return 'Windows 7';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('CrOS')) return 'Chrome OS';
  return 'Unknown';
}

/**
 * Parse device type from user agent
 */
function parseUserAgentDevice(ua: string): string {
  if (ua.includes('Mobile') || (ua.includes('Android') && !ua.includes('Tablet'))) return 'Mobile';
  if (ua.includes('Tablet') || ua.includes('iPad')) return 'Tablet';
  if (
    ua.includes('curl') ||
    ua.includes('python') ||
    ua.includes('axios') ||
    ua.includes('Postman')
  )
    return 'CLI/Script';
  if (ua.includes('bot') || ua.includes('Bot') || ua.includes('crawler') || ua.includes('spider'))
    return 'Bot';
  return 'Desktop';
}

/**
 * Detect anomalies in request headers that might indicate an attack
 */
function detectAnomalies(headers: Headers, userAgent: string): string[] {
  const anomalies: string[] = [];

  // Missing common headers
  if (!headers.get('accept')) anomalies.push('missing-accept-header');
  if (!headers.get('accept-language')) anomalies.push('missing-accept-language');
  if (!headers.get('accept-encoding')) anomalies.push('missing-accept-encoding');

  // CLI/Script tools (not necessarily malicious but notable)
  if (userAgent.includes('curl') || userAgent.includes('wget')) {
    anomalies.push('cli-tool-detected');
  }
  if (
    userAgent.includes('python-requests') ||
    userAgent.includes('axios') ||
    userAgent.includes('node-fetch')
  ) {
    anomalies.push('http-library-detected');
  }

  // Bot/Crawler detection
  if (/bot|crawler|spider|scraper/i.test(userAgent)) {
    anomalies.push('bot-user-agent');
  }

  // Empty or suspicious user agent
  if (!userAgent || userAgent === 'unknown' || userAgent.length < 10) {
    anomalies.push('suspicious-user-agent');
  }

  // Very long user agent (potential injection attempt)
  if (userAgent.length > 500) {
    anomalies.push('oversized-user-agent');
  }

  // Multiple proxies in chain (potential evasion)
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded && forwarded.split(',').length > 3) {
    anomalies.push('multiple-proxy-chain');
  }

  // Mismatched Sec-Fetch headers (might indicate spoofing)
  const secFetchSite = headers.get('sec-fetch-site');
  const origin = headers.get('origin');
  if (secFetchSite === 'cross-site' && !origin) {
    anomalies.push('cross-site-without-origin');
  }

  return anomalies;
}

/**
 * Generate a correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

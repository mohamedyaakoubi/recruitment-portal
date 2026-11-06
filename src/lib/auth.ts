// src/lib/auth.ts
import { NextRequest } from 'next/server';
import { ApiErrors } from './apiResponse';
import logger from './logger';
import { getAuthAdmin } from './firebase-admin';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from './security-logger';

/**
 * Admin authentication middleware for API routes
 * Uses Firebase Auth ID token verification
 */
export async function requireAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminSession = request.cookies.get('admin_session')?.value;
    const context = extractSecurityContext(request);

    // Check for token presence
    if (!authHeader && !adminSession) {
      logSecurityEvent({
        type: SecurityEventType.AUTH_FAILURE,
        ...context,
        details: { reason: 'No token provided' },
      });

      logger.warn('Unauthorized admin API access attempt', {
        path: request.nextUrl.pathname,
        ip: context.ip,
      });

      return ApiErrors.unauthorized('Admin authentication required');
    }

    // Extract token from Bearer format
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : adminSession || '';

    if (!token) {
      logSecurityEvent({
        type: SecurityEventType.AUTH_FAILURE,
        ...context,
        details: { reason: 'Invalid token format' },
      });
      return ApiErrors.unauthorized('Invalid authentication token');
    }

    // Verify Firebase ID token
    try {
      const auth = getAuthAdmin();
      const decodedToken = await auth.verifyIdToken(token, true); // checkRevoked = true

      // Check if token is for an admin user
      const adminEmailsEnv = process.env.ADMIN_EMAILS;
      if (!adminEmailsEnv) {
        logger.error('ADMIN_EMAILS environment variable not configured');
        return ApiErrors.internal('Admin authentication not configured');
      }

      const adminEmails = adminEmailsEnv.split(',').map((e) => e.trim());

      if (!decodedToken.email || !adminEmails.includes(decodedToken.email)) {
        logSecurityEvent({
          type: SecurityEventType.UNAUTHORIZED_ACCESS,
          userId: decodedToken.uid,
          ...context,
          details: { reason: 'Not an admin user', email: decodedToken.email },
        });
        return ApiErrors.forbidden('Access denied. Admin privileges required.');
      }

      // Log successful authentication
      logSecurityEvent({
        type: SecurityEventType.AUTH_SUCCESS,
        userId: decodedToken.uid,
        ...context,
      });

      return null; // Authentication successful
    } catch (error) {
      // Handle specific Firebase Auth errors
      if (error instanceof Error) {
        const errorCode = (error as { code?: string }).code;

        if (errorCode === 'auth/id-token-expired') {
          logSecurityEvent({
            type: SecurityEventType.AUTH_EXPIRED_TOKEN,
            ...context,
          });
          return ApiErrors.unauthorized('Authentication token has expired');
        }

        if (errorCode === 'auth/id-token-revoked') {
          logSecurityEvent({
            type: SecurityEventType.AUTH_INVALID_TOKEN,
            ...context,
            details: { reason: 'Token revoked' },
          });
          return ApiErrors.unauthorized('Authentication token has been revoked');
        }

        if (
          errorCode === 'auth/argument-error' ||
          errorCode === 'auth/invalid-id-token' ||
          errorCode === 'auth/user-not-found'
        ) {
          logSecurityEvent({
            type: SecurityEventType.AUTH_INVALID_TOKEN,
            ...context,
            details: { reason: error.message },
          });
          return ApiErrors.unauthorized('Invalid authentication token');
        }
      }

      // Log unknown authentication error
      logger.error('Token verification failed', error);
      logSecurityEvent({
        type: SecurityEventType.AUTH_FAILURE,
        ...context,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      return ApiErrors.unauthorized('Authentication failed');
    }
  } catch (error) {
    logger.error('Authentication error', error);
    return ApiErrors.internal('Authentication error');
  }
}

/**
 * Check if the request has valid admin credentials
 * Returns boolean instead of Response for flexibility
 */
export async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const result = await requireAdminAuth(request);
  return result === null;
}

/**
 * Extract user info from request (for logging and audit trails)
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<{ id: string; email: string; ip: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const adminSession = request.cookies.get('admin_session')?.value;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : adminSession || '';

    if (!token) {
      return null;
    }

    const auth = getAuthAdmin();
    const decodedToken = await auth.verifyIdToken(token, false); // Don't check revoked for logging

    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    return {
      id: decodedToken.uid,
      email: decodedToken.email || 'unknown',
      ip,
    };
  } catch {
    // If token verification fails, return minimal info
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    return {
      id: 'unknown',
      email: 'unknown',
      ip,
    };
  }
}

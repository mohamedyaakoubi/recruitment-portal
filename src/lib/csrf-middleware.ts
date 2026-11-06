/**
 * CSRF Protection Middleware for API Routes
 * Validates CSRF tokens for state-changing operations (POST, PUT, PATCH, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken } from './csrf';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from './security-logger';
import { ApiErrors } from './apiResponse';

/**
 * Validate CSRF token for state-changing requests
 */
export async function validateCsrf(request: NextRequest): Promise<NextResponse | null> {
  // Only validate CSRF for state-changing methods
  const methodsRequiringCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!methodsRequiringCsrf.includes(request.method)) {
    return null; // No validation needed
  }

  // Get session ID from cookie
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) {
    const context = extractSecurityContext(request);
    logSecurityEvent({
      type: SecurityEventType.CSRF_VALIDATION_FAILED,
      ...context,
      details: { reason: 'No session ID - client needs to call /api/csrf-token first' },
    });
    return NextResponse.json(
      {
        error: 'Session not initialized. Please initialize CSRF protection.',
        code: 'CSRF_SESSION_MISSING',
        action: 'Call GET /api/csrf-token to initialize session',
      },
      { status: 403 }
    );
  }

  // Get CSRF token from header or body
  const csrfToken =
    request.headers.get('x-csrf-token') || request.headers.get('X-CSRF-Token') || '';

  if (!csrfToken) {
    const context = extractSecurityContext(request);
    logSecurityEvent({
      type: SecurityEventType.CSRF_VALIDATION_FAILED,
      ...context,
      details: { reason: 'No CSRF token provided' },
    });
    return ApiErrors.forbidden('CSRF token required');
  }

  // Validate the token
  const isValid = await validateCsrfToken(sessionId, csrfToken);
  if (!isValid) {
    const context = extractSecurityContext(request);
    logSecurityEvent({
      type: SecurityEventType.CSRF_VALIDATION_FAILED,
      ...context,
      details: { reason: 'Invalid or expired token' },
    });
    return ApiErrors.forbidden('Invalid or expired CSRF token');
  }

  return null; // Validation successful
}

/**
 * Higher-order function to wrap API route handlers with CSRF protection
 */
export function withCsrfProtection<C = unknown>(
  handler: (request: NextRequest, context?: C) => Promise<NextResponse>
) {
  // The second parameter is Next.js's route context ({ params }). Next.js 15.5
  // checks that every exported handler accepts it, so it must not be typed as
  // a rest parameter, which TypeScript infers as never[] for one-argument handlers.
  return async (request: NextRequest, context?: C): Promise<NextResponse> => {
    // Validate CSRF
    const csrfError = await validateCsrf(request);
    if (csrfError) {
      return csrfError;
    }

    // If validation passes, call the original handler
    return handler(request, context);
  };
}

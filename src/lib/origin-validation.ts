/**
 * Origin Validation Middleware
 * Provides origin/referer validation for public endpoints
 */

import { NextRequest } from 'next/server';
import logger from './logger';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean) as string[];

/**
 * Validate request origin/referer
 * Returns true if origin is allowed, false otherwise
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Allow requests without origin/referer in development
  if (process.env.NODE_ENV === 'development' && !origin && !referer) {
    return true;
  }

  // Check origin header
  if (origin && ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
    return true;
  }

  // Check referer header as fallback
  if (referer && ALLOWED_ORIGINS.some((allowed) => referer.startsWith(allowed))) {
    return true;
  }

  // Log suspicious request
  logger.warn('Request with invalid origin/referer', {
    origin,
    referer,
    path: request.nextUrl.pathname,
    ip: request.headers.get('x-forwarded-for') || 'unknown',
  });

  return false;
}

/**
 * Get origin validation error response data
 */
export function getOriginValidationError() {
  return {
    success: false,
    error: 'Invalid request origin',
    code: 'INVALID_ORIGIN',
  };
}

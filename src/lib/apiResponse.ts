import { NextResponse } from 'next/server';
import logger from './logger';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  options: { message?: string; status?: number } = {}
): NextResponse<ApiSuccessResponse<T>> {
  const { message, status = 200 } = options;

  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string,
  options: { status?: number; code?: string; details?: unknown; logError?: Error | unknown } = {}
): NextResponse<ApiErrorResponse> {
  const { status = 500, code, details, logError } = options;

  // Log the error if provided
  if (logError) {
    logger.error(error, logError instanceof Error ? logError : new Error(String(logError)));
  }

  // In production, sanitize error details to prevent information leakage
  const isProduction = process.env.NODE_ENV === 'production';
  const sanitizedDetails = isProduction && status === 500 ? undefined : details;

  return NextResponse.json(
    {
      success: false as const,
      error: isProduction && status === 500 ? 'Internal server error' : error,
      ...(code && { code }),
      ...(sanitizedDetails !== undefined && { details: sanitizedDetails }),
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  badRequest: (message = 'Bad request', details?: unknown) =>
    errorResponse(message, { status: 400, code: 'BAD_REQUEST', details }),

  unauthorized: (message = 'Unauthorized') =>
    errorResponse(message, { status: 401, code: 'UNAUTHORIZED' }),

  forbidden: (message = 'Forbidden') => errorResponse(message, { status: 403, code: 'FORBIDDEN' }),

  notFound: (message = 'Resource not found') =>
    errorResponse(message, { status: 404, code: 'NOT_FOUND' }),

  conflict: (message = 'Resource already exists') =>
    errorResponse(message, { status: 409, code: 'CONFLICT' }),

  tooManyRequests: (message = 'Too many requests') =>
    errorResponse(message, { status: 429, code: 'RATE_LIMITED' }),

  internal: (message = 'Internal server error', logError?: Error | unknown) =>
    errorResponse(message, { status: 500, code: 'INTERNAL_ERROR', logError }),
};

/**
 * Wrap an async handler with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch((error: unknown) => {
    logger.error('Unhandled API error', error instanceof Error ? error : new Error(String(error)));
    return ApiErrors.internal('An unexpected error occurred', error);
  });
}

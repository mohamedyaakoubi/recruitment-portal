/**
 * Custom Error Classes for Better Error Handling
 * Provides specific error types for different scenarios
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Type guard to check if error is one of our custom errors
 */
export function isCustomError(
  error: unknown
): error is
  | ValidationError
  | AuthenticationError
  | AuthorizationError
  | NetworkError
  | DatabaseError
  | ExternalServiceError {
  return (
    error instanceof ValidationError ||
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError ||
    error instanceof NetworkError ||
    error instanceof DatabaseError ||
    error instanceof ExternalServiceError
  );
}

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Wrap a function with error handling and logging
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      // Log error with context
      console.error(`[${context}]`, error);
      throw error;
    }
  }) as T;
}

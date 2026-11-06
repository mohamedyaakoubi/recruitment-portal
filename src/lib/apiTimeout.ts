/**
 * API Timeout Utilities
 * Provides timeout protection for external API calls
 */

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Promise with timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Operation timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
  ]);
}

/**
 * Timeout configurations for different services
 */
export const TIMEOUT_CONFIG = {
  ABSTRACT_API: 8000, // 8 seconds
  GOOGLE_API: 15000, // 15 seconds
  FIREBASE_API: 10000, // 10 seconds
  GEMINI_API: 30000, // 30 seconds for AI processing
  EMAIL_SEND: 20000, // 20 seconds for SMTP
  DEFAULT: 10000, // 10 seconds default
};

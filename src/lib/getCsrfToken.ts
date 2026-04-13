/**
 * Shared CSRF token helper for client-side fetch calls.
 *
 * Reads the `csrf-token` cookie (httpOnly: false).  If the cookie is absent
 * the session has not been initialised yet — calling GET /api/csrf-token sets
 * both the `session_id` (httpOnly) and `csrf-token` cookies and then we re-read.
 *
 * Usage:
 *   const response = await fetch('/api/some-route', {
 *     method: 'POST',
 *     headers: await secureHeaders(),
 *     body: JSON.stringify(payload),
 *   });
 */

import logger from '@/lib/logger';

function readCsrfCookie(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.split(';').find((c) => c.trim().startsWith('csrf-token='));
  return match ? match.split('=').slice(1).join('=').trim() : '';
}

export async function getCsrfToken(): Promise<string> {
  let token = readCsrfCookie();
  if (!token) {
    try {
      await fetch('/api/csrf-token', { credentials: 'same-origin' });
    } catch (err) {
      logger.error('Failed to fetch CSRF token', err);
    }
    token = readCsrfCookie();
  }
  return token;
}

/** Headers for state-changing (POST/PUT/DELETE) requests */
export async function secureHeaders(): Promise<Record<string, string>> {
  return { 'Content-Type': 'application/json', 'X-CSRF-Token': await getCsrfToken() };
}

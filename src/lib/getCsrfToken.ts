/**
 * Shared CSRF token helper for client-side fetch calls.
 *
 * Reads the `csrf-token` cookie (httpOnly: false).  If the cookie is absent
 * the session has not been initialised yet — calling GET /api/csrf-token sets
 * both the `session_id` (httpOnly) and `csrf-token` cookies and then we re-read.
 *
 * Also attaches the Firebase ID token as `Authorization: Bearer <token>` so
 * admin API routes can verify the caller via requireAdminAuth().
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

/** Get the current Firebase user's ID token, or empty string if not signed in */
async function getFirebaseIdToken(): Promise<string> {
  try {
    // Dynamically import to avoid pulling firebase/auth into non-admin bundles
    const { auth } = await import('@/lib/firebase');
    const { getIdToken } = await import('firebase/auth');
    const user = auth.currentUser;
    if (!user) return '';
    return await getIdToken(user, /* forceRefresh */ false);
  } catch (err) {
    logger.error('Failed to get Firebase ID token', err);
    return '';
  }
}

/** Headers for state-changing (POST/PUT/DELETE) admin requests */
export async function secureHeaders(): Promise<Record<string, string>> {
  const [csrfToken, idToken] = await Promise.all([getCsrfToken(), getFirebaseIdToken()]);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  };
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }
  return headers;
}

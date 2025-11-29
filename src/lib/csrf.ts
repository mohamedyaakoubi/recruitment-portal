/**
 * CSRF Protection Implementation
 * Provides token generation and validation for state-changing operations
 */

import { randomBytes } from 'crypto';
import Tokens from 'csrf';

const tokens = new Tokens();

// Store tokens in-memory (use Redis in production for multi-instance)
const tokenStore = new Map<string, { secret: string; timestamp: number }>();

// Token expiration time (15 minutes)
const TOKEN_EXPIRATION_MS = 15 * 60 * 1000;

// Maximum token store size (prevent memory leaks)
const MAX_TOKEN_STORE_SIZE = 10000;

/**
 * Generate a CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
  // Clean up expired tokens periodically
  cleanupExpiredTokens();

  // Enforce max size limit (LRU eviction: remove oldest)
  if (tokenStore.size >= MAX_TOKEN_STORE_SIZE) {
    const oldestKey = tokenStore.keys().next().value;
    if (oldestKey) {
      tokenStore.delete(oldestKey);
    }
  }

  // Generate a secret for this session
  const secret = tokens.secretSync();
  const token = tokens.create(secret);

  // Store the secret with timestamp
  tokenStore.set(sessionId, {
    secret,
    timestamp: Date.now(),
  });

  return token;
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId);

  if (!stored) {
    return false;
  }

  // Check if token has expired
  if (Date.now() - stored.timestamp > TOKEN_EXPIRATION_MS) {
    tokenStore.delete(sessionId);
    return false;
  }

  // Verify the token
  return tokens.verify(stored.secret, token);
}

/**
 * Generate a session ID if not present
 */
export function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, data] of tokenStore.entries()) {
    if (now - data.timestamp > TOKEN_EXPIRATION_MS) {
      tokenStore.delete(sessionId);
    }
  }
}

/**
 * Remove a session's CSRF token
 */
export function removeCsrfToken(sessionId: string): void {
  tokenStore.delete(sessionId);
}

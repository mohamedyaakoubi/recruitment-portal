/**
 * Request ID Middleware
 * Generates and tracks unique request IDs for correlation
 */

import { v4 as uuidv4 } from 'uuid';

let requestIdCounter = 0;

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  const timestamp = Date.now();
  const counter = ++requestIdCounter;
  const random = Math.random().toString(36).substring(2, 6);
  return `req_${timestamp}_${counter}_${random}`;
}

/**
 * Generate UUID-based request ID (more globally unique)
 */
export function generateUuidRequestId(): string {
  return `req_${uuidv4()}`;
}

/**
 * Extract request ID from headers or generate new one
 */
export function getOrCreateRequestId(headers: Headers): string {
  // Check if client sent a request ID
  const clientRequestId = headers.get('x-request-id');
  if (clientRequestId && /^req_[a-zA-Z0-9-_]+$/.test(clientRequestId)) {
    return clientRequestId;
  }

  // Generate new request ID
  return generateRequestId();
}

/**
 * Add request ID to response headers
 */
export function addRequestIdToHeaders(headers: Headers, requestId: string): void {
  headers.set('X-Request-ID', requestId);
}

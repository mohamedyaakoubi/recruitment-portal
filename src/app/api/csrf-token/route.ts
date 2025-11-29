/**
 * CSRF Token API
 * Generates CSRF tokens for client-side requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken, generateSessionId } from '@/lib/csrf';
import logger from '@/lib/logger';

export const runtime = 'nodejs'; // Force Node.js runtime for crypto module

/**
 * GET /api/csrf-token
 * Generate or retrieve a CSRF token for the current session
 */
export async function GET(request: NextRequest) {
  try {
    // Get or create session ID
    let sessionId = request.cookies.get('session_id')?.value;

    const response = NextResponse.json({ success: true });

    if (!sessionId) {
      sessionId = generateSessionId();
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
    }

    // Generate CSRF token
    const csrfToken = generateCsrfToken(sessionId);
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // Must be readable by client JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('CSRF token generation error', error);
    return NextResponse.json({ error: 'Failed to generate CSRF token' }, { status: 500 });
  }
}

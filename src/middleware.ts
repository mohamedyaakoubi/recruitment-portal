import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import { getOrCreateRequestId, addRequestIdToHeaders } from '@/lib/requestId';
import { REQUEST_LIMITS } from '@/lib/constants';

// CORS allowed origins
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  // Add additional production domains via NEXT_PUBLIC_APP_URL
];

/**
 * Apply CORS headers
 */
function applyCorsHeaders(response: NextResponse, origin: string | null): void {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token, X-Requested-With'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
  }
}

/**
 * Apply comprehensive security headers
 */
function applySecurityHeaders(response: NextResponse): void {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Content Security Policy - stricter in production
  const scriptSrc = isDevelopment
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseio.com https://accounts.google.com"
    : "'self' 'unsafe-inline' https://apis.google.com https://*.firebaseio.com https://accounts.google.com";

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src 'self' 'unsafe-inline' https://accounts.google.com;
    img-src 'self' blob: data: https://*.googleapis.com https://*.googleusercontent.com https://firebasestorage.googleapis.com;
    font-src 'self' data: https://accounts.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src https://accounts.google.com https://*.firebaseapp.com;
    connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://accounts.google.com;
    upgrade-insecure-requests;
  `
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  // HSTS - Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Permissions Policy - Disable unused features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
}

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const context = extractSecurityContext(request);

  // Generate or extract request ID for correlation
  const requestId = getOrCreateRequestId(request.headers);

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    applyCorsHeaders(response, origin);
    addRequestIdToHeaders(response.headers, requestId);
    return response;
  }

  // Handle API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip health check and keepalive endpoints from rate limiting
    if (
      request.nextUrl.pathname === '/api/health' ||
      request.nextUrl.pathname === '/api/redis-keepalive'
    ) {
      const response = NextResponse.next();
      applySecurityHeaders(response);
      applyCorsHeaders(response, origin);
      addRequestIdToHeaders(response.headers, requestId);
      return response;
    }

    // Validate request body size to prevent buffer overflow attacks
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      const contentLength = request.headers.get('content-length');

      if (contentLength) {
        const bodySize = parseInt(contentLength, 10);
        const contentType = request.headers.get('content-type') || '';

        // Use different limits based on content type
        const maxSize = contentType.includes('multipart/form-data')
          ? REQUEST_LIMITS.MAX_FORM_SIZE_BYTES
          : REQUEST_LIMITS.MAX_JSON_SIZE_BYTES;

        if (bodySize > maxSize) {
          logSecurityEvent({
            type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            ...context,
            details: {
              reason: 'Request body size exceeds limit',
              bodySize,
              maxSize,
              contentType,
            },
          });

          const response = NextResponse.json(
            {
              error: 'Request body too large',
              message: `Maximum allowed size is ${maxSize / (1024 * 1024)}MB`,
            },
            { status: 413 }
          );

          applySecurityHeaders(response);
          applyCorsHeaders(response, origin);
          addRequestIdToHeaders(response.headers, requestId);
          return response;
        }
      }
    }

    // Apply rate limiting
    const identifier = getRateLimitIdentifier(request);

    let rateLimitResult;
    try {
      rateLimitResult = await checkRateLimit(identifier, request.nextUrl.pathname);
    } catch (error) {
      // On error, allow request through but log it
      console.error('[Middleware] Rate limit error:', error);
      rateLimitResult = { success: true, limit: 0, remaining: 0, reset: Date.now() };
    }

    if (!rateLimitResult.success) {
      logSecurityEvent({
        type: SecurityEventType.RATE_LIMIT_EXCEEDED,
        ...context,
        details: {
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset,
        },
      });

      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );

      applySecurityHeaders(response);
      applyCorsHeaders(response, origin);
      addRequestIdToHeaders(response.headers, requestId);
      return response;
    }

    // Create response with rate limit headers
    const response = NextResponse.next();

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());

    // Apply security headers
    applySecurityHeaders(response);
    applyCorsHeaders(response, origin);
    addRequestIdToHeaders(response.headers, requestId);

    return response;
  }

  // Rate limit admin login page to prevent brute force attacks
  if (request.nextUrl.pathname === '/admin-dashboard-secret/login') {
    const identifier = getRateLimitIdentifier(request);

    let rateLimitResult;
    try {
      rateLimitResult = await checkRateLimit(identifier, request.nextUrl.pathname);
    } catch (error) {
      console.error('[Middleware] Rate limit error on login page:', error);
      rateLimitResult = { success: true, limit: 0, remaining: 0, reset: Date.now() };
    }

    if (!rateLimitResult.success) {
      logSecurityEvent({
        type: SecurityEventType.RATE_LIMIT_EXCEEDED,
        ...context,
        details: {
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset,
          page: 'admin-login',
        },
      });

      // Return a simple HTML page for rate limited login attempts
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      const response = new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Too Many Requests</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #dc2626; margin-bottom: 1rem; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Too Many Login Attempts</h1>
    <p>Please wait ${retryAfter} seconds before trying again.</p>
  </div>
</body>
</html>`,
        {
          status: 429,
          headers: {
            'Content-Type': 'text/html',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      );

      applySecurityHeaders(response);
      addRequestIdToHeaders(response.headers, requestId);
      return response;
    }
  }

  // For non-API routes, apply security headers
  const response = NextResponse.next();

  // Apply security headers
  applySecurityHeaders(response);
  applyCorsHeaders(response, origin);
  addRequestIdToHeaders(response.headers, requestId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

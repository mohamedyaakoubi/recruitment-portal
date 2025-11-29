import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';

// CORS allowed origins
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'https://internationalskills.fi',
  // Add production domains here
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

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    applyCorsHeaders(response, origin);
    return response;
  }

  // Handle API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip health check endpoint from rate limiting
    if (request.nextUrl.pathname === '/api/health') {
      const response = NextResponse.next();
      applySecurityHeaders(response);
      applyCorsHeaders(response, origin);
      return response;
    }

    // Apply rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, request.nextUrl.pathname);

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

    return response;
  }

  // For non-API routes, apply security headers
  const response = NextResponse.next();

  // Apply security headers
  applySecurityHeaders(response);
  applyCorsHeaders(response, origin);

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

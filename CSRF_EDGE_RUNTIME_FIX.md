# CSRF Edge Runtime Fix

## Problem
The CSRF protection implementation was causing an Edge Runtime error:
```
Error [TypeError]: assert is not a function
A Node.js module is loaded ('crypto' at line 6) which is not supported in the Edge Runtime.
```

The `csrf.ts` library uses Node.js `crypto` module, which is not available in Edge Runtime where middleware executes by default.

## Solution
**Moved CSRF token generation out of middleware into a dedicated API route.**

### Changes Made

#### 1. **Middleware** (`src/middleware.ts`)
- ✅ Removed `generateCsrfToken` and `generateSessionId` imports
- ✅ Removed CSRF token generation logic from middleware
- ✅ Middleware now only handles rate limiting and security headers

#### 2. **New CSRF Token Endpoint** (`src/app/api/csrf-token/route.ts`)
- ✅ Created dedicated endpoint: `GET /api/csrf-token`
- ✅ Explicitly set `runtime = 'nodejs'` to use Node.js runtime
- ✅ Generates session ID and CSRF token on-demand
- ✅ Sets cookies with proper security flags

#### 3. **CSRF Middleware** (`src/lib/csrf-middleware.ts`)
- ✅ Updated error message when session is missing
- ✅ Provides clear guidance to call `/api/csrf-token` first

## How It Works Now

### For Client-Side Applications:
1. **Initialize session** by calling `GET /api/csrf-token` before making protected requests
2. Server generates session ID and CSRF token, sets cookies
3. Client includes CSRF token in `X-CSRF-Token` header for POST/PUT/DELETE requests
4. Server validates token using `withCsrfProtection` wrapper

### Example Usage:
```typescript
// Initialize CSRF protection (once per session)
await fetch('/api/csrf-token');

// Get token from cookie for subsequent requests
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf-token='))
  ?.split('=')[1];

// Make protected request
await fetch('/api/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ title: 'New Job' })
});
```

## Testing
✅ Dev server starts without errors
✅ Middleware runs in Edge Runtime (fast)
✅ CSRF token generation runs in Node.js runtime (full crypto support)
✅ All protected API routes maintain CSRF validation

## Benefits
- ✅ **Edge Runtime compatibility**: Middleware runs on Edge (faster, lower latency)
- ✅ **Node.js crypto support**: Token generation uses full Node.js crypto API
- ✅ **Clear error messages**: Developers know to call `/api/csrf-token` first
- ✅ **Session management**: Explicit session initialization flow
- ✅ **No breaking changes**: All `withCsrfProtection` wrappers work as before

# Security Improvements Plan V3

**Date:** November 29, 2025  
**Status:** Analysis Complete - Pending Implementation  
**Scope:** Application security excluding Firebase/database rules

---

## Executive Summary

After comprehensive security audit of the codebase, I've identified **9 security improvements** across 4 priority levels. The existing implementation already includes solid security fundamentals (JWT verification, rate limiting, CSRF, CSP, input validation). The items below represent additional hardening for production-grade security.

---

## Priority 1: Critical (Immediate Action Required)

### 1.1 ❌ CSRF Protection Not Applied to API Routes

**Current State:** CSRF middleware (`csrf-middleware.ts`) exists but is NOT being used by any API route handlers.

**Risk:** State-changing operations (POST/PUT/DELETE) can be vulnerable to Cross-Site Request Forgery attacks.

**Files Affected:**
- `src/app/api/jobs/route.ts` - POST, PUT, DELETE (admin)
- `src/app/api/update-status/route.ts` - POST (admin)
- `src/app/api/update-candidate/route.ts` - PUT (no auth!)
- `src/app/api/cancel-interview/route.ts` - POST (admin)
- `src/app/api/schedule-interview-meet/route.ts` - POST (admin)
- `src/app/api/score-candidate/route.ts` - POST (admin)
- `src/app/api/send-confirmation-email/route.ts` - POST (admin)

**Solution:** Apply `withCsrfProtection` wrapper to all state-changing endpoints.

**Effort:** Low (2-3 hours)

---

### 1.2 ⚠️ Missing Authentication on Sensitive Endpoints

**Current State:** Some endpoints that modify or access candidate data have no authentication:

1. `src/app/api/update-candidate/route.ts` - **PUT** - No auth, can update any candidate
2. `src/app/api/export-candidates/route.ts` - **GET** - No auth, can export all candidate data
3. `src/app/api/get-candidate-applications/route.ts` - **POST** - No auth, can get all applications by email

**Risk:** Unauthorized access to sensitive PII (Personally Identifiable Information).

**Solution:** Add `requireAdminAuth` to export and potentially rate-limit/validate public candidate routes.

**Effort:** Low (1-2 hours)

---

## Priority 2: High (Should Be Addressed Soon)

### 2.1 🔒 Secrets Exposed in .env.local

**Current State:** `.env.local` contains production API keys, SMTP credentials, and private keys. This file is tracked or could be accidentally committed.

**Risk:** Credential leakage if `.env.local` is committed or exposed.

**Findings:**
- Firebase Admin private key (full key)
- Gemini API key
- SMTP credentials (password visible)
- Google OAuth client secret
- Abstract API key

**Solution:**
1. Ensure `.env.local` is in `.gitignore`
2. Consider using secrets manager for production
3. Create `.env.example` with placeholder values

**Effort:** Low (30 min)

---

### 2.2 🔐 Request Body Size Limits Not Enforced

**Current State:** `REQUEST_LIMITS` defined in constants but not enforced in middleware or routes.

```typescript
// Defined but not used
export const REQUEST_LIMITS = {
  MAX_JSON_SIZE_BYTES: 1024 * 1024, // 1 MB
  MAX_FORM_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  MAX_REQUEST_TIMEOUT_MS: 30000, // 30 seconds
} as const;
```

**Risk:** Denial of Service via large payload attacks.

**Solution:** Enforce body size limits in middleware or Next.js config.

**Effort:** Medium (2-3 hours)

---

### 2.3 📧 Email Template Injection Risk

**Current State:** Email templates use string replacement without sanitization:

```typescript
htmlBody = getTemplate('statusRejected', 'html')
  .replace(/\${companyName}/g, companyName)
  .replace(/\${candidateName}/g, candidateName);
```

**Risk:** If `candidateName` contains HTML/JS, it could be injected into emails.

**Solution:** Sanitize user input before template injection using `sanitizeText()`.

**Effort:** Low (1 hour)

---

## Priority 3: Medium (Recommended Improvements)

### 3.1 🕐 Token Expiration Handling on Client

**Current State:** No mechanism to detect expired admin sessions client-side. Users may experience silent failures.

**Solution:** 
- Implement token refresh logic
- Add interceptor to detect 401 responses and redirect to login
- Consider adding session timeout warnings

**Effort:** Medium (4-5 hours)

---

### 3.2 📝 Audit Trail Enhancement

**Current State:** Security logger exists but doesn't capture all sensitive operations:
- Job creation/update/deletion
- Candidate score updates
- Interview scheduling
- Export operations

**Solution:** Add security logging to all admin operations with user ID, action, and timestamp.

**Effort:** Medium (3-4 hours)

---

### 3.3 🔍 JSON.parse Error Handling

**Current State:** `JSON.parse` in `phoneValidationService.ts` and `scoring.ts` could throw on malformed input.

```typescript
const data = JSON.parse(responseText); // Can throw
```

**Risk:** Unhandled exceptions could leak stack traces or crash the service.

**Solution:** Wrap all `JSON.parse` calls in try-catch with proper error handling.

**Effort:** Low (1 hour)

---

## Priority 4: Low (Nice to Have)

### 4.1 🛡️ Additional CSP Refinements

**Current State:** CSP allows `'unsafe-inline'` and `'unsafe-eval'` for development.

**Solution:** 
- Remove `'unsafe-eval'` in production
- Consider nonce-based CSP for inline scripts

**Effort:** Medium (3-4 hours)

---

## Implementation Summary

| # | Item | Priority | Effort | Risk Level |
|---|------|----------|--------|------------|
| 1.1 | CSRF Protection on API Routes | Critical | Low | High |
| 1.2 | Missing Auth on Sensitive Endpoints | Critical | Low | High |
| 2.1 | Secrets in .env.local | High | Low | Medium |
| 2.2 | Request Body Size Limits | High | Medium | Medium |
| 2.3 | Email Template Injection | High | Low | Medium |
| 3.1 | Token Expiration Handling | Medium | Medium | Low |
| 3.2 | Audit Trail Enhancement | Medium | Medium | Low |
| 3.3 | JSON.parse Error Handling | Medium | Low | Low |
| 4.1 | CSP Refinements | Low | Medium | Low |

---

## Already Implemented ✅

The following security measures are already in place:

- ✅ JWT Token Validation with Firebase Admin SDK
- ✅ Content Security Policy (CSP)
- ✅ CORS Configuration
- ✅ CSRF Token Generation (middleware)
- ✅ Rate Limiting (Upstash + in-memory fallback)
- ✅ Security Headers (HSTS, X-Frame-Options, etc.)
- ✅ Input Validation with Zod (max lengths, patterns)
- ✅ URL Sanitization (blocks javascript:, data:, vbscript:)
- ✅ HTML Sanitization with DOMPurify
- ✅ Session Cookie Hardening (HttpOnly, Secure, SameSite)
- ✅ Security Event Logging Infrastructure
- ✅ Error Pages (no stack trace exposure to users)
- ✅ TLS 1.2+ for SMTP
- ✅ Admin Email Configuration

---

## Recommended Implementation Order

1. **Phase 1 (Immediate - 4 hours)**
   - 1.1 Apply CSRF protection to all state-changing routes
   - 1.2 Add auth to export and candidate application routes

2. **Phase 2 (Same Day - 3 hours)**
   - 2.1 Verify .gitignore for secrets
   - 2.3 Sanitize email template inputs
   - 3.3 Add JSON.parse error handling

3. **Phase 3 (Next Sprint - 6 hours)**
   - 2.2 Enforce request body size limits
   - 3.2 Enhance audit trail

4. **Phase 4 (Future)**
   - 3.1 Client-side token refresh
   - 4.1 CSP refinements

---

## Approval

- [ ] Review complete
- [ ] Approved for implementation
- [ ] Phase 1 approved
- [ ] All phases approved

---

*Generated by Security Audit on November 29, 2025*

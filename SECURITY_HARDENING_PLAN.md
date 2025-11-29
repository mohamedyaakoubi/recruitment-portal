# Production Security Hardening Plan

## Executive Summary

This document outlines a comprehensive security hardening plan to bring the application to production-grade security standards. Based on a thorough audit, **15 critical security gaps** have been identified that need to be addressed before production deployment.

**Risk Level**: HIGH - Several critical vulnerabilities need immediate attention.

---

## Current Security Posture

### ✅ Already Implemented
- Basic rate limiting (in-memory)
- Input validation with Zod schemas
- Basic security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- TLS validation enabled in production
- No dangerous patterns (dangerouslySetInnerHTML, eval)
- Firebase Admin SDK with proper initialization

### ❌ Critical Gaps Identified
1. **No JWT/Token Validation** - Auth middleware uses placeholder user ID
2. **No Content-Security-Policy (CSP)** - Missing critical XSS protection
3. **No CORS Configuration** - API endpoints have no origin restrictions
4. **No CSRF Protection** - State-changing operations vulnerable
5. **In-Memory Rate Limiting** - Not production-ready for multi-instance deployments
6. **Hardcoded Admin Email** - Firestore rules use hardcoded email
7. **Missing Security Headers** - No Referrer-Policy, Permissions-Policy, HSTS
8. **No API Request Signing** - No integrity verification for sensitive operations
9. **Session Management Gaps** - Cookie security attributes not hardened
10. **No Security Logging/Monitoring** - No audit trail for security events
11. **Storage Rules Locked** - Firebase Storage completely disabled
12. **No Environment-Based Config** - Admin list should be environment variable
13. **Missing Input Sanitization** - HTML content not sanitized
14. **No Request Size Limits** - API vulnerable to large payload attacks
15. **No API Versioning Security** - Breaking changes could expose vulnerabilities

---

## Implementation Plan

### Phase 1: Critical Authentication & Authorization (Priority: CRITICAL)

#### 1.1 Implement Proper JWT Validation
**File**: `src/lib/auth.ts`
**Current Issue**: Contains `TODO: Implement proper JWT validation`
**Risk**: High - Anyone can forge admin access

```typescript
// Implementation:
// - Verify Firebase ID tokens server-side
// - Validate token expiration and issuer
// - Check token revocation status
// - Return actual user ID from token
```

**Tasks**:
- [ ] Replace placeholder verification with Firebase Admin `verifyIdToken()`
- [ ] Add token expiration validation
- [ ] Implement token revocation checking
- [ ] Add proper error responses for invalid tokens

#### 1.2 Environment-Based Admin Configuration
**File**: `firestore.rules`, `src/lib/constants.ts`
**Current Issue**: Hardcoded admin email `airopanget@gmail.com`
**Risk**: Medium - Difficult to manage admin access

**Tasks**:
- [ ] Create `ADMIN_EMAILS` environment variable
- [ ] Update Firestore rules to use Firebase Auth custom claims
- [ ] Create admin management API endpoint
- [ ] Add admin role verification in API routes

#### 1.3 Session Security Hardening
**File**: `src/middleware.ts`, API routes
**Current Issue**: Cookies missing security attributes

**Tasks**:
- [ ] Set `HttpOnly` flag on all session cookies
- [ ] Set `Secure` flag in production
- [ ] Set `SameSite=Strict` for all cookies
- [ ] Implement session rotation on privilege changes
- [ ] Add session timeout configuration

---

### Phase 2: Security Headers & CSP (Priority: HIGH)

#### 2.1 Content Security Policy Implementation
**File**: `next.config.ts`, `src/middleware.ts`
**Current Issue**: No CSP header
**Risk**: High - XSS attacks can execute arbitrary code

**Implementation**:
```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseio.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.googleapis.com https://*.googleusercontent.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src https://accounts.google.com https://*.firebaseapp.com;
  connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com;
  upgrade-insecure-requests;
`.replace(/\n/g, '');
```

**Tasks**:
- [ ] Add CSP header to `next.config.ts`
- [ ] Configure for Firebase and Google APIs
- [ ] Test all features work with CSP enabled
- [ ] Add CSP violation reporting endpoint

#### 2.2 Complete Security Headers
**File**: `next.config.ts`
**Current Issue**: Missing several important headers

**Tasks**:
- [ ] Add `Strict-Transport-Security` (HSTS)
- [ ] Add `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Add `Permissions-Policy` to disable unused features
- [ ] Add `X-Permitted-Cross-Domain-Policies: none`
- [ ] Update `X-Frame-Options` to use CSP frame-ancestors

---

### Phase 3: CSRF & CORS Protection (Priority: HIGH)

#### 3.1 CSRF Token Implementation
**Files**: `src/middleware.ts`, API routes, forms
**Current Issue**: No CSRF protection
**Risk**: High - State-changing requests can be forged

**Tasks**:
- [ ] Create CSRF token generation utility
- [ ] Add CSRF token validation middleware
- [ ] Update all forms to include CSRF token
- [ ] Add `X-CSRF-Token` header requirement for API calls
- [ ] Implement double-submit cookie pattern

#### 3.2 CORS Configuration
**File**: `src/middleware.ts`, `next.config.ts`
**Current Issue**: No CORS configuration
**Risk**: Medium - API can be accessed from any origin

**Tasks**:
- [ ] Configure allowed origins list
- [ ] Add CORS middleware for API routes
- [ ] Set appropriate `Access-Control-Allow-*` headers
- [ ] Block requests from unauthorized origins
- [ ] Handle preflight OPTIONS requests

---

### Phase 4: Rate Limiting & DDoS Protection (Priority: HIGH)

#### 4.1 Production-Ready Rate Limiting
**File**: `src/middleware.ts`, new Redis integration
**Current Issue**: In-memory rate limiting doesn't work across instances
**Risk**: Medium - Rate limiting ineffective in production

**Tasks**:
- [ ] Add Redis/Upstash integration for rate limit storage
- [ ] Implement sliding window rate limiting
- [ ] Add per-endpoint rate limits
- [ ] Create rate limit headers (X-RateLimit-*)
- [ ] Add exponential backoff for repeated violations

**Configuration**:
```typescript
const rateLimits = {
  '/api/auth/*': { requests: 10, window: '1m' },
  '/api/admin/*': { requests: 100, window: '1m' },
  '/api/candidates/*': { requests: 50, window: '1m' },
  '/api/upload/*': { requests: 10, window: '1m' },
};
```

#### 4.2 Request Size Limits
**File**: `src/middleware.ts`, API routes
**Current Issue**: No payload size validation
**Risk**: Medium - Large payloads can DoS the server

**Tasks**:
- [ ] Add `body-parser` limits in API routes
- [ ] Set max upload size for file uploads
- [ ] Add request timeout configuration
- [ ] Implement request depth limiting for JSON

---

### Phase 5: Input Validation & Sanitization (Priority: MEDIUM)

#### 5.1 HTML Content Sanitization
**Files**: Components rendering user content
**Current Issue**: No HTML sanitization utility
**Risk**: Medium - Stored XSS if user content rendered

**Tasks**:
- [ ] Add DOMPurify or similar sanitization library
- [ ] Create sanitization utility function
- [ ] Audit all user content rendering points
- [ ] Add sanitization to form submissions

#### 5.2 Enhanced Zod Validation
**File**: `src/lib/validations.ts`
**Current Status**: Good foundation exists
**Improvement**: Add more security-focused validations

**Tasks**:
- [ ] Add URL validation for redirect parameters
- [ ] Add file type validation for uploads
- [ ] Add maximum length limits to all string fields
- [ ] Add pattern validation for sensitive fields (emails, phone)

---

### Phase 6: Firebase Security Rules Hardening (Priority: HIGH)

#### 6.1 Firestore Rules Update
**File**: `firestore.rules`
**Current Issue**: Hardcoded admin email, broad permissions

**Tasks**:
- [ ] Implement custom claims-based admin check
- [ ] Add field-level validation rules
- [ ] Add rate limiting at rules level
- [ ] Restrict candidate document creation to valid fields only
- [ ] Add timestamp validation for created/updated fields
- [ ] Implement document size limits

#### 6.2 Storage Rules Configuration
**File**: `storage.rules`
**Current Issue**: `allow read, write: if false` - completely locked

**Tasks**:
- [ ] Configure CV upload path permissions
- [ ] Add file type validation (PDF, DOC, DOCX only)
- [ ] Add file size limits (max 5MB)
- [ ] Restrict access to own files for candidates
- [ ] Allow admin read access to all files

---

### Phase 7: Security Monitoring & Logging (Priority: MEDIUM)

#### 7.1 Security Event Logging
**File**: New `src/lib/security-logger.ts`
**Current Issue**: No security audit trail

**Tasks**:
- [ ] Create security event logger
- [ ] Log authentication attempts (success/failure)
- [ ] Log authorization failures
- [ ] Log rate limit violations
- [ ] Log suspicious activity patterns
- [ ] Add correlation IDs for request tracing

#### 7.2 Monitoring & Alerting
**Infrastructure**: External monitoring setup

**Tasks**:
- [ ] Set up error monitoring (Sentry/similar)
- [ ] Configure security alerts for:
  - Multiple failed login attempts
  - Rate limit threshold breaches
  - Unusual API usage patterns
- [ ] Set up log aggregation
- [ ] Create security dashboard

---

### Phase 8: Additional Security Measures (Priority: LOW)

#### 8.1 API Security Enhancements
- [ ] Add API versioning with security considerations
- [ ] Implement request signing for sensitive operations
- [ ] Add request ID tracking
- [ ] Implement circuit breakers for downstream services

#### 8.2 Dependency Security
- [ ] Set up automated dependency scanning (npm audit)
- [ ] Configure Dependabot/Renovate for security updates
- [ ] Create lockfile verification in CI/CD

#### 8.3 Infrastructure Security
- [ ] Document environment variable security
- [ ] Create secrets management guide
- [ ] Add deployment security checklist
- [ ] Configure proper HTTPS/TLS settings

---

## Implementation Priority Matrix

| Phase | Priority | Effort | Risk Reduction |
|-------|----------|--------|----------------|
| 1. Auth & Authorization | CRITICAL | High | Very High |
| 2. Security Headers & CSP | HIGH | Medium | High |
| 3. CSRF & CORS | HIGH | Medium | High |
| 4. Rate Limiting | HIGH | Medium | Medium |
| 5. Input Sanitization | MEDIUM | Low | Medium |
| 6. Firebase Rules | HIGH | Medium | High |
| 7. Security Logging | MEDIUM | Medium | Medium |
| 8. Additional Measures | LOW | High | Low |

---

## Recommended Implementation Order

### Week 1: Critical Security (Phases 1 & 2)
1. Implement proper JWT validation (Day 1-2)
2. Add complete security headers including CSP (Day 2-3)
3. Harden session management (Day 3-4)
4. Update Firebase rules for admin management (Day 4-5)

### Week 2: Protection Mechanisms (Phases 3 & 4)
1. Implement CSRF protection (Day 1-2)
2. Configure CORS properly (Day 2-3)
3. Set up Redis-based rate limiting (Day 3-4)
4. Add request size limits (Day 4-5)

### Week 3: Hardening & Monitoring (Phases 5, 6 & 7)
1. Add input sanitization (Day 1)
2. Enhance Zod validations (Day 2)
3. Update Firebase Storage rules (Day 2-3)
4. Implement security logging (Day 3-4)
5. Set up monitoring (Day 4-5)

### Week 4: Final Hardening (Phase 8)
1. Additional API security measures
2. Dependency security setup
3. Security testing and penetration testing
4. Documentation and runbooks

---

## Testing Requirements

Each security feature must include:
1. **Unit tests** for validation logic
2. **Integration tests** for middleware/auth flows
3. **E2E tests** for critical security paths
4. **Manual security testing** for edge cases

### Security Test Scenarios
- [ ] Test invalid JWT tokens are rejected
- [ ] Test expired tokens are rejected
- [ ] Test CSRF protection blocks forged requests
- [ ] Test rate limiting blocks excessive requests
- [ ] Test CORS blocks unauthorized origins
- [ ] Test CSP blocks inline scripts (where applicable)
- [ ] Test input validation rejects malicious payloads
- [ ] Test Firebase rules block unauthorized access

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Security Headers Score (securityheaders.com) | D | A |
| OWASP Top 10 Compliance | 40% | 90% |
| Authentication Strength | Low | High |
| Rate Limiting Effectiveness | 0% (single instance) | 100% |
| Security Monitoring Coverage | 0% | 80% |

---

## Dependencies & Resources

### NPM Packages to Add
- `@upstash/ratelimit` - Serverless rate limiting
- `@upstash/redis` - Redis for rate limit storage
- `dompurify` / `isomorphic-dompurify` - HTML sanitization
- `csrf` - CSRF token generation
- `helmet` (concepts) - Security header reference

### External Services
- Upstash Redis (or similar) for distributed rate limiting
- Sentry or similar for error monitoring
- Cloudflare or similar for DDoS protection (recommended)

---

## Approval & Sign-off

- [ ] Security review completed
- [ ] All critical items implemented
- [ ] All tests passing
- [ ] Penetration testing completed
- [ ] Production deployment approved

---

**Document Version**: 1.0
**Created**: Based on security audit
**Last Updated**: Current session
**Next Review**: After Phase 1 completion

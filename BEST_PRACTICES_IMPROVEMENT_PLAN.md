# Codebase Best Practices Improvement Plan

## Executive Summary

This document outlines actionable improvements to enhance code quality, security, performance, and maintainability. Items are prioritized by impact and effort.

---

## High Priority

### 1. CSRF Token Store - Distributed Storage for Production
**Files:** `src/lib/csrf.ts`  
**Issue:** In-memory CSRF token store doesn't work in multi-instance deployments.  
**Solution:** Implement Redis-based token storage with fallback warning for development.  
**Effort:** Medium  

---

## Medium Priority

### 2. Split Large `useCandidateForm` Hook
**Files:** `src/hooks/useCandidateForm.ts` (590+ lines)  
**Issue:** Single hook handles too many responsibilities (form state, validation, file handling, submission).  
**Solution:** Split into focused hooks:
- `useFormValidation.ts` - Validation logic
- `useFileUpload.ts` - File handling
- `useFormSubmission.ts` - API submission
- `useCandidateFormState.ts` - State management  
**Effort:** High  

### 3. Accessibility - Focus Trap in All Modals
**Files:**
- `src/app/components/admin-dashboard/ScoringModal.tsx`
- `src/app/components/admin-dashboard/ProfileModal.tsx`
- `src/app/components/admin-dashboard/ConfirmationDialog.tsx`

**Issue:** Some modals lack focus trapping and proper ARIA attributes.  
**Solution:** Implement `useFocusTrap` hook consistently, add `role="dialog"` and `aria-modal="true"`.  
**Effort:** Low  

### 4. Accessibility - ARIA Labels on Buttons
**Files:**
- `src/app/components/admin-dashboard/StatsGrid.tsx`
- `src/app/components/admin-dashboard/RecentCandidatesList.tsx`

**Issue:** Icon-only buttons missing `aria-label` attributes.  
**Solution:** Add descriptive `aria-label` to all interactive elements.  
**Effort:** Low  

### 5. Hardcoded Admin Email
**Files:** `src/services/interview.ts` (line 68)  
**Issue:** Fallback admin email hardcoded: `'wassim@internationalskills.fi'`  
**Solution:** Move to environment variable `FALLBACK_ADMIN_EMAIL`.  
**Effort:** Low  

### 6. Missing Origin Validation on Public Endpoints
**Files:**
- `src/app/api/send-confirmation-email/route.ts`
- `src/app/api/check-duplicate/route.ts`

**Issue:** Public endpoints only have rate limiting, no origin validation.  
**Solution:** Add `Referer` or `Origin` header validation for additional abuse protection.  
**Effort:** Low  

### 7. Memory Management in CSRF Token Store
**Files:** `src/lib/csrf.ts`  
**Issue:** Token store can grow unbounded with only periodic cleanup.  
**Solution:** Implement max size limit with LRU eviction.  
**Effort:** Low  

### 8. Error Handling Categorization
**Files:** `src/lib/apiHandlers.ts`  
**Issue:** All errors treated the same without categorization.  
**Solution:** Create error classes for different error types:
```typescript
class ValidationError extends Error {}
class AuthenticationError extends Error {}
class NetworkError extends Error {}
```
**Effort:** Medium  

### 9. Missing Try-Catch in Service Functions
**Files:**
- `src/lib/utils.ts` - `calculateAge`, `sanitizeFilename`
- `src/lib/fileValidation.ts` - Various validation functions

**Issue:** Functions don't wrap in try-catch, relying on caller.  
**Solution:** Add defensive error handling with meaningful error messages.  
**Effort:** Low  

### 10. Integration Tests for Critical Paths
**Files:** `src/__tests__/integration/` (new directory)  
**Issue:** Missing integration tests for:
- Candidate form submission flow
- Interview scheduling workflow
- Status update with email notification

**Solution:** Add React Testing Library integration tests.  
**Effort:** High  

### 11. API Route Unit Tests
**Files:** `src/app/api/**/route.test.ts` (new files)  
**Issue:** No unit tests for API routes.  
**Solution:** Add tests using mock NextRequest/NextResponse.  
**Effort:** High  

---

## Low Priority

### 12. Extract Sub-Components from JobManagement
**Files:** `src/app/components/admin-dashboard/JobManagement.tsx` (450+ lines)  
**Issue:** Contains multiple components in single file.  
**Solution:** Extract to:
- `src/app/components/admin-dashboard/job-management/JobListItem.tsx`
- `src/app/components/admin-dashboard/job-management/InputField.tsx`
- `src/app/components/admin-dashboard/job-management/ActionButton.tsx`  
**Effort:** Medium  

### 13. Consolidate Age Calculation
**Files:**
- `src/lib/utils.ts`
- `src/hooks/useCandidateForm.ts`
- `src/services/candidate.ts`

**Issue:** Duplicate `calculateAge` implementations.  
**Solution:** Use single source from `src/lib/utils.ts`.  
**Effort:** Low  

### 14. Memoization in Modal Components
**Files:**
- `src/app/components/admin-dashboard/ProfileModal.tsx`
- `src/app/components/admin-dashboard/ConfirmationDialog.tsx`

**Issue:** Event handlers recreated on every render.  
**Solution:** Wrap with `useCallback`.  
**Effort:** Low  

### 15. React.memo on List Components
**Files:** `src/app/components/admin-dashboard/JobManagement.tsx`  
**Issue:** `JobListItem` re-renders on every parent state change.  
**Solution:** Wrap with `React.memo`.  
**Effort:** Low  

### 16. Type Safety in Test Files
**Files:** `src/__tests__/**/*.test.ts`  
**Issue:** Heavy use of `any` type in mocks.  
**Solution:** Create proper mock type utilities.  
**Effort:** Medium  

### 17. Loose Typing in Validation Schema
**Files:** `src/lib/validation.ts`  
**Issue:** `submittedAt` uses `unknown` type.  
**Solution:** Define proper Timestamp interface.  
**Effort:** Low  

### 18. Environment Variable Format Validation
**Files:** `src/lib/env-validation.ts`  
**Issue:** No format validation (email format, URL format).  
**Solution:** Add Zod schema validation for env vars.  
**Effort:** Low  

### 19. Centralize Default Values
**Files:** Various  
**Issue:** Default values scattered across files.  
**Solution:** Create `src/lib/config.ts` for all defaults.  
**Effort:** Low  

### 20. Structured Logging for Production
**Files:** `src/lib/logger.ts`  
**Issue:** String format logging not ideal for production.  
**Solution:** Add JSON structured logging option for production.  
**Effort:** Medium  

### 21. API Documentation
**Files:** All API routes  
**Issue:** No OpenAPI/Swagger documentation.  
**Solution:** Add JSDoc comments with OpenAPI annotations.  
**Effort:** Medium  

### 22. Granular Error Boundaries
**Files:** `src/app/admin-dashboard-secret/page.tsx`  
**Issue:** Individual sections don't have error boundaries.  
**Solution:** Wrap critical sections with `<ErrorBoundary>`.  
**Effort:** Low  

---

## Implementation Order

### Phase 1: Quick Wins (1-2 days)
- [ ] #4 ARIA Labels on Buttons
- [ ] #5 Hardcoded Admin Email
- [ ] #13 Consolidate Age Calculation
- [ ] #14 Memoization in Modal Components
- [ ] #15 React.memo on List Components

### Phase 2: Security & Accessibility (2-3 days)
- [ ] #3 Focus Trap in All Modals
- [ ] #6 Origin Validation on Public Endpoints
- [ ] #7 Memory Management in CSRF Token Store
- [ ] #9 Missing Try-Catch in Service Functions

### Phase 3: Code Organization (3-5 days)
- [ ] #2 Split useCandidateForm Hook
- [ ] #12 Extract JobManagement Sub-Components
- [ ] #8 Error Handling Categorization

### Phase 4: Testing (5-7 days)
- [ ] #10 Integration Tests
- [ ] #11 API Route Unit Tests

### Phase 5: Production Readiness (2-3 days)
- [ ] #1 CSRF Token Store - Redis
- [ ] #18 Environment Variable Validation
- [ ] #19 Centralize Default Values
- [ ] #20 Structured Logging

### Phase 6: Polish (Ongoing)
- [ ] #16 Type Safety in Test Files
- [ ] #17 Loose Typing in Validation
- [ ] #21 API Documentation
- [ ] #22 Granular Error Boundaries

---

## Notes

- Items marked with "Effort: High" may require breaking into smaller tasks
- Security items should be prioritized before deployment to production
- Testing improvements should be done alongside feature development
- Some items may be deferred if development velocity is the priority

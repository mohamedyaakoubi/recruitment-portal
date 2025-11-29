# Best Practices Implementation Plan

## Current State Assessment

### ✅ Already Implemented Well:
- TypeScript strict mode with `noUncheckedIndexedAccess`
- ESLint with strict rules (no-console, no-any, etc.)
- Centralized logger utility (`src/lib/logger.ts`)
- Zod validation schemas defined (`src/lib/validations.ts`)
- Error boundary (`src/app/error.tsx`)
- Loading states (`src/app/loading.tsx`)
- 404 page (`src/app/not-found.tsx`)
- Rate limiting middleware
- Security headers in middleware

---

## Priority 1: API Input Validation with Zod (High Impact)

### Issue
Zod validation schemas exist in `src/lib/validations.ts` but are NOT being used in API routes. All routes use manual validation which is error-prone and inconsistent.

### Files to Update

#### 1. `src/app/api/update-status/route.ts`
**Current:** Manual validation
**Change to:** Use `statusUpdateSchema` from validations

```typescript
import { statusUpdateSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = statusUpdateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validatedData.error.flatten() },
        { status: 400 }
      );
    }
    
    const { candidateId, newStatus, interviewTimestampISO, calendarEventId, meetLink, duration } = validatedData.data;
    // ... rest of the logic
  }
}
```

#### 2. `src/app/api/score-candidate/route.ts`
**Use:** `scoreCandidateSchema`

#### 3. `src/app/api/schedule-interview-meet/route.ts`
**Use:** `scheduleInterviewSchema`

#### 4. `src/app/api/check-duplicate/route.ts`
**Create and use:** New `checkDuplicateSchema` in validations.ts

```typescript
// Add to src/lib/validations.ts
export const checkDuplicateSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  jobId: z.string().min(1),
  jobCategory: z.string().min(1),
});
```

#### 5. `src/app/api/update-candidate/route.ts`
**Use:** `updateCandidateSchema`

#### 6. `src/app/api/cancel-interview/route.ts`
**Create and use:** New `cancelInterviewSchema`

```typescript
// Add to src/lib/validations.ts
export const cancelInterviewSchema = z.object({
  candidateId: z.string().min(1),
  reason: z.string().optional(),
});
```

---

## Priority 2: Constants & Magic Values Centralization (Medium Impact)

### Issue
Magic strings scattered across codebase (status values, rate limits, file limits, etc.)

### Create: `src/lib/constants.ts`

```typescript
// Candidate statuses
export const CANDIDATE_STATUSES = ['submitted', 'rejected', 'interview_scheduled', 'approved'] as const;
export type CandidateStatus = typeof CANDIDATE_STATUSES[number];

// AI recommendation values
export const AI_RECOMMENDATIONS = ['highly_recommended', 'recommended', 'conditional', 'not_recommended'] as const;
export type AIRecommendation = typeof AI_RECOMMENDATIONS[number];

// Rate limiting
export const RATE_LIMITS = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 60,
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_CV_SIZE_MB: 5,
  MAX_PHOTO_SIZE_MB: 2,
  MAX_PASSPORT_SIZE_MB: 5,
  ALLOWED_CV_TYPES: ['.pdf', '.doc', '.docx'] as const,
  ALLOWED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png'] as const,
  ALLOWED_PASSPORT_TYPES: ['.pdf', '.jpg', '.jpeg', '.png'] as const,
} as const;

// Interview defaults
export const INTERVIEW_DEFAULTS = {
  MIN_DURATION: 15,
  MAX_DURATION: 180,
  DEFAULT_DURATION: 30,
} as const;

// Application limits
export const APPLICATION_LIMITS = {
  MAX_PER_CATEGORY_PER_MONTH: 3,
  COOLDOWN_MONTHS_SAME_JOB: 6,
} as const;

// Scoring
export const SCORING = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  VERSION: 'gemini-2.5-pro-enhanced',
} as const;
```

### Files to Update
1. `src/services/candidate.ts` - Replace hardcoded `validStatuses` array with `CANDIDATE_STATUSES`
2. `src/types/index.ts` - Import and use `CandidateStatus` type
3. `src/middleware.ts` - Use `RATE_LIMITS` constants
4. `src/lib/validations.ts` - Use constants for enum values
5. `src/services/scoring.ts` - Use `SCORING` constants

---

## Priority 3: Performance Optimization - React.memo & useCallback (Medium Impact)

### Issue
Large list components re-render unnecessarily when parent state changes

### Files to Update

#### 1. `src/app/components/candidate-table/CandidateTableRow.tsx`
```typescript
import React from 'react';

const CandidateTableRow: React.FC<CandidateTableRowProps> = React.memo(({
  candidate,
  splitName,
  calculateAge,
  onViewCandidate,
  onScoreCandidate,
  onEditCandidate,
}) => {
  // ... existing component code
});

CandidateTableRow.displayName = 'CandidateTableRow';

export default CandidateTableRow;
```

#### 2. `src/app/components/CandidateTable.tsx`
Wrap with `React.memo`

#### 3. `src/app/components/CandidateFilters.tsx`
Wrap with `React.memo`

#### 4. `src/app/components/candidate-table/CandidateTableActions.tsx`
Wrap with `React.memo`

#### 5. `src/app/components/ui/StatusBadge.tsx`
Wrap with `React.memo` (rendered for every row)

---

## Priority 4: Accessibility Improvements (Medium Impact)

### Issue
Modal components missing proper ARIA attributes for screen readers

### Files to Update

#### 1. `src/app/components/ui/ConfirmationModal.tsx`
Add:
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby="confirmation-modal-title"`
- `aria-describedby="confirmation-modal-description"`
- Focus trap
- ESC key handler

#### 2. `src/app/components/CandidateProfileModal.tsx`
Add same ARIA attributes

#### 3. `src/app/components/InterviewSchedulingModal.tsx`
Add same ARIA attributes

#### 4. `src/app/components/EditCandidateModal.tsx`
Add same ARIA attributes

#### 5. `src/app/components/ScoringModal.tsx`
Add same ARIA attributes

#### 6. `src/app/components/JobManagement.tsx`
Add same ARIA attributes (it's a modal)

### Pattern for All Modals:
```tsx
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
  <h2 id="modal-title">Title Here</h2>
  <p id="modal-description">Description here</p>
  {/* content */}
</div>
```

---

## Priority 5: Error Response Standardization (Low Impact)

### Issue
Inconsistent error response formats across API routes

### Create: `src/lib/apiResponse.ts`

```typescript
import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export function errorResponse(
  message: string, 
  code: ErrorCode, 
  status: number, 
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: message, code, details }, 
    { status }
  );
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

// Common error responses
export const errors = {
  validation: (details: unknown) => 
    errorResponse('Validation failed', ERROR_CODES.VALIDATION_ERROR, 400, details),
  notFound: (resource: string) => 
    errorResponse(`${resource} not found`, ERROR_CODES.NOT_FOUND, 404),
  unauthorized: () => 
    errorResponse('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401),
  rateLimited: () => 
    errorResponse('Too many requests. Please try again later.', ERROR_CODES.RATE_LIMITED, 429),
  internal: (message = 'Internal server error') => 
    errorResponse(message, ERROR_CODES.INTERNAL_ERROR, 500),
};
```

### Update All API Routes to Use This Pattern

---

## Priority 6: Sub-route Loading States (Low Impact)

### Issue
Only root and admin dashboard have loading.tsx files

### Create Loading States For:

#### 1. `src/app/candidate-form/loading.tsx`
```tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#003A70] border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading application form...</p>
      </div>
    </div>
  );
}
```

#### 2. `src/app/candidate-dashboard/loading.tsx`
```tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#003A70] border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
      </div>
    </div>
  );
}
```

#### 3. `src/app/candidate-choices/loading.tsx`
```tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#003A70] border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading options...</p>
      </div>
    </div>
  );
}
```

---

## Priority 7: Clean Up Debug Test Files (Low Impact)

### Issue
Debug test files contain `console.log` statements that shouldn't be in production code

### Files to Clean/Remove:

#### Option A: Remove Debug Files Entirely
- `src/app/components/__tests__/ReactDOMTest.test.tsx`
- `src/app/components/__tests__/VitestSimple.test.tsx`
- `src/app/components/__tests__/SimpleTest.test.tsx`
- `src/app/components/__tests__/DebugModules.test.tsx`
- `src/app/components/__tests__/ClientComponentTest.test.tsx`

#### Option B: Clean Up Console Logs
Remove all `console.log` statements from test files (ESLint allows console in test files but they add noise)

---

## Execution Checklist

### Phase 1: API Validation (Estimated: 2-3 hours)
- [ ] Add new schemas to `src/lib/validations.ts`
- [ ] Update `src/app/api/update-status/route.ts`
- [ ] Update `src/app/api/score-candidate/route.ts`
- [ ] Update `src/app/api/schedule-interview-meet/route.ts`
- [ ] Update `src/app/api/check-duplicate/route.ts`
- [ ] Update `src/app/api/update-candidate/route.ts`
- [ ] Update `src/app/api/cancel-interview/route.ts`
- [ ] Run `pnpm lint` and `pnpm test`

### Phase 2: Constants (Estimated: 1-2 hours)
- [ ] Create `src/lib/constants.ts`
- [ ] Update `src/services/candidate.ts`
- [ ] Update `src/types/index.ts`
- [ ] Update `src/middleware.ts`
- [ ] Update `src/lib/validations.ts`
- [ ] Run `pnpm lint` and `pnpm test`

### Phase 3: Performance (Estimated: 1 hour)
- [ ] Update `CandidateTableRow.tsx` with React.memo
- [ ] Update `CandidateTable.tsx` with React.memo
- [ ] Update `CandidateFilters.tsx` with React.memo
- [ ] Update `CandidateTableActions.tsx` with React.memo
- [ ] Update `StatusBadge.tsx` with React.memo
- [ ] Run `pnpm lint` and `pnpm test`

### Phase 4: Accessibility (Estimated: 2 hours)
- [ ] Update `ConfirmationModal.tsx`
- [ ] Update `CandidateProfileModal.tsx`
- [ ] Update `InterviewSchedulingModal.tsx`
- [ ] Update `EditCandidateModal.tsx`
- [ ] Update `ScoringModal.tsx`
- [ ] Update `JobManagement.tsx`
- [ ] Run `pnpm lint` and `pnpm test`

### Phase 5: Error Responses (Estimated: 2 hours)
- [ ] Create `src/lib/apiResponse.ts`
- [ ] Update all API routes to use standardized responses
- [ ] Run `pnpm lint` and `pnpm test`

### Phase 6: Loading States (Estimated: 30 minutes)
- [ ] Create `src/app/candidate-form/loading.tsx`
- [ ] Create `src/app/candidate-dashboard/loading.tsx`
- [ ] Create `src/app/candidate-choices/loading.tsx`
- [ ] Run `pnpm lint`

### Phase 7: Cleanup (Estimated: 30 minutes)
- [ ] Remove or clean debug test files
- [ ] Run `pnpm lint` and `pnpm test`

---

## Notes for Agent

1. **Always run after changes:**
   - `pnpm lint` - Check for ESLint errors
   - `pnpm test` - Run unit tests
   - `pnpm build` - Ensure build passes

2. **TypeScript strict mode is ON** - Handle all `undefined` cases properly

3. **Follow existing patterns:**
   - Use the centralized logger (`import logger from '@/lib/logger'`)
   - Never use `console.log` in production code
   - Use existing type definitions from `src/types/index.ts`

4. **Testing:**
   - After API validation changes, verify with manual API calls or Postman
   - After React.memo changes, verify components still render correctly

5. **Do NOT modify:**
   - Database schemas
   - Environment variables or `.env` files
   - Firebase configuration

# 🚀 Final Best Practices Implementation Plan (V3)

This document contains the remaining best practice improvements to complete the codebase quality enhancement.

**Previous Plans Status:**
- ✅ IMPROVEMENT_PLAN.md - 17 tasks completed (Logger, Error Boundaries, React Query setup, etc.)
- ✅ IMPROVEMENT_PLAN_V2.md - 18 tasks completed (React Query hooks, Type Safety, SEO, UI Components, Accessibility)

---

## 📋 Table of Contents

1. [Console Statement Migration](#1-console-statement-migration)
2. [ESLint Enhancement](#2-eslint-enhancement)
3. [Prettier Configuration](#3-prettier-configuration)
4. [Pre-commit Hooks Setup](#4-pre-commit-hooks-setup)
5. [API Response Standardization](#5-api-response-standardization)

---

## 1. Console Statement Migration

### Task 1.1: Migrate console statements in API routes

**Files to modify:**

#### `src/app/api/export-candidates/route.ts`
```typescript
// Replace:
console.log('🔍 Export request with filters:', { ... });
console.log(`✅ Exporting ${candidates.length} candidates...`);
console.error('❌ Export candidates error:', error);

// With:
logger.info('Export request with filters', { ... });
logger.info('Exporting candidates', { count: candidates.length, format: exportFormat });
logger.error('Export candidates error', error);
```

#### `src/app/api/check-candidate/route.ts`
```typescript
// Replace:
console.log('🔍 Checking database for email:', searchEmail);
console.log('✅ Found existing candidate in database');
console.log('❌ No existing candidate found - will need email verification');
console.error('Check candidate error:', error);

// With:
logger.info('Checking database for email', { email: searchEmail });
logger.info('Found existing candidate in database');
logger.info('No existing candidate found - will need email verification');
logger.error('Check candidate error', error);
```

#### `src/app/api/get-candidate-applications/route.ts`
```typescript
// Replace:
console.log('🔍 Fetching applications for email:', searchEmail);
console.log(`✅ Found ${applications.length} applications for ${searchEmail}`);
console.error('❌ Get candidate applications error:', error);

// With:
logger.info('Fetching applications for email', { email: searchEmail });
logger.info('Found applications', { count: applications.length, email: searchEmail });
logger.error('Get candidate applications error', error);
```

#### `src/app/api/check-duplicate/route.ts`
```typescript
// Replace:
console.error('Check duplicate error:', error);

// With:
logger.error('Check duplicate error', error);
```

#### `src/app/api/cancel-interview/route.ts`
```typescript
// Replace:
console.error('Error cancelling interview:', error);

// With:
logger.error('Error cancelling interview', error);
```

---

### Task 1.2: Migrate console statements in components

#### `src/app/components/DashboardCharts.tsx`
```typescript
// Remove debug console.log:
console.log('DashboardCharts rendering', { statusChartData, scoreDistributionData });

// Or replace with:
logger.debug('DashboardCharts rendering', { statusChartData, scoreDistributionData });
```

#### `src/app/components/JobManagement.tsx`
```typescript
// Replace:
console.error('Error fetching jobs:', err);
console.error('Error saving job:', err);

// With:
logger.error('Error fetching jobs', err);
logger.error('Error saving job', err);
```

#### `src/app/components/ScoringModal.tsx`
```typescript
// Replace:
console.error('Error loading jobs:', error);

// With:
logger.error('Error loading jobs', error);
```

#### `src/app/components/StatsCards.tsx`
```typescript
// Replace:
console.warn('Warning: Scheduled count is higher than submitted count...');

// With:
logger.warn('Scheduled count is higher than submitted count. This may indicate data inconsistency.');
```

#### `src/app/components/InterviewSchedulingModal.tsx`
```typescript
// Replace:
console.error('Error in modal:', error);

// With:
logger.error('Error in interview scheduling modal', error);
```

#### `src/app/components/admin-dashboard/GoogleAuthManager.tsx`
```typescript
// Replace:
console.error("Failed to fetch Google auth status:", error);

// With:
logger.error('Failed to fetch Google auth status', error);
```

---

### Task 1.3: Migrate console statements in hooks

#### `src/hooks/useEditCandidateForm.ts`
```typescript
// Replace:
console.error('Error fetching jobs:', error);

// With:
logger.error('Error fetching jobs', error);
```

---

## 2. ESLint Enhancement

### Task 2.1: Update ESLint configuration

**File to modify:** `eslint.config.mjs`

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Prevent console statements in production code
      "no-console": ["warn", { allow: ["warn", "error"] }],
      
      // TypeScript strict rules
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React best practices
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      
      // Import organization
      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc" }
      }],
    },
  },
  {
    // Allow console in test files
    files: ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-console": "off",
    },
  },
];

export default eslintConfig;
```

---

## 3. Prettier Configuration

### Task 3.1: Create Prettier configuration

**New file to create:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Task 3.2: Create Prettier ignore file

**New file to create:** `.prettierignore`

```
# Dependencies
node_modules/
pnpm-lock.yaml

# Build outputs
.next/
out/
build/
dist/

# Generated files
*.min.js
*.min.css

# Test outputs
coverage/
test-results/
playwright-report/

# Firebase
.firebase/

# Misc
*.md
*.txt
*.log
```

### Task 3.3: Add Prettier dependencies and scripts

**File to modify:** `package.json`

Add to devDependencies:
```json
"prettier": "^3.2.5",
"prettier-plugin-tailwindcss": "^0.5.14"
```

Add to scripts:
```json
"format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,css}\"",
"format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,css}\""
```

---

## 4. Pre-commit Hooks Setup

### Task 4.1: Install Husky and lint-staged

Run command:
```bash
pnpm add -D husky lint-staged
```

### Task 4.2: Initialize Husky

Run command:
```bash
npx husky init
```

### Task 4.3: Create pre-commit hook

**New file to create:** `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### Task 4.4: Configure lint-staged

**Add to `package.json`:**

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,json}": [
    "prettier --write"
  ]
}
```

---

## 5. API Response Standardization

### Task 5.1: Create API response utility

**New file to create:** `src/lib/apiResponse.ts`

```typescript
import { NextResponse } from 'next/server';
import logger from './logger';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  options: { message?: string; status?: number } = {}
): NextResponse<ApiSuccessResponse<T>> {
  const { message, status = 200 } = options;
  
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string,
  options: { status?: number; code?: string; details?: unknown; logError?: Error | unknown } = {}
): NextResponse<ApiErrorResponse> {
  const { status = 500, code, details, logError } = options;
  
  // Log the error if provided
  if (logError) {
    logger.error(error, logError instanceof Error ? logError : new Error(String(logError)));
  }
  
  return NextResponse.json(
    {
      success: false as const,
      error,
      ...(code && { code }),
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  badRequest: (message = 'Bad request', details?: unknown) =>
    errorResponse(message, { status: 400, code: 'BAD_REQUEST', details }),
    
  unauthorized: (message = 'Unauthorized') =>
    errorResponse(message, { status: 401, code: 'UNAUTHORIZED' }),
    
  forbidden: (message = 'Forbidden') =>
    errorResponse(message, { status: 403, code: 'FORBIDDEN' }),
    
  notFound: (message = 'Resource not found') =>
    errorResponse(message, { status: 404, code: 'NOT_FOUND' }),
    
  conflict: (message = 'Resource already exists') =>
    errorResponse(message, { status: 409, code: 'CONFLICT' }),
    
  tooManyRequests: (message = 'Too many requests') =>
    errorResponse(message, { status: 429, code: 'RATE_LIMITED' }),
    
  internal: (message = 'Internal server error', logError?: Error | unknown) =>
    errorResponse(message, { status: 500, code: 'INTERNAL_ERROR', logError }),
};

/**
 * Wrap an async handler with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch((error: unknown) => {
    logger.error('Unhandled API error', error instanceof Error ? error : new Error(String(error)));
    return ApiErrors.internal('An unexpected error occurred', error);
  });
}
```

### Task 5.2: Example usage in an API route

**Example refactor for `src/app/api/jobs/route.ts`:**

```typescript
import { successResponse, errorResponse, ApiErrors, withErrorHandler } from '@/lib/apiResponse';

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const result = await getJobs(activeOnly);
    
    return successResponse(result, { message: 'Jobs fetched successfully' });
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    
    if (!body.title || !body.category) {
      return ApiErrors.badRequest('Title and category are required');
    }

    const jobId = await createJob(body);
    
    return successResponse({ jobId }, { status: 201, message: 'Job created successfully' });
  });
}
```

---

## 📊 Implementation Checklist

### Phase 1: Console Migration (Priority: HIGH) - ~15 files
- [ ] Task 1.1: Migrate API route console statements (5 files)
- [ ] Task 1.2: Migrate component console statements (6 files)
- [ ] Task 1.3: Migrate hook console statements (1 file)

### Phase 2: Code Quality Tools (Priority: MEDIUM)
- [ ] Task 2.1: Update ESLint configuration
- [ ] Task 3.1: Create Prettier configuration
- [ ] Task 3.2: Create Prettier ignore file
- [ ] Task 3.3: Add Prettier dependencies and scripts

### Phase 3: Pre-commit Hooks (Priority: MEDIUM)
- [ ] Task 4.1: Install Husky and lint-staged
- [ ] Task 4.2: Initialize Husky
- [ ] Task 4.3: Create pre-commit hook
- [ ] Task 4.4: Configure lint-staged

### Phase 4: API Standardization (Priority: LOW)
- [ ] Task 5.1: Create API response utility
- [ ] Task 5.2: Refactor existing API routes (optional, can be done incrementally)

---

## 📝 Notes for Implementation

1. **Console migration first**: This is the quickest win and removes debug noise
2. **Test after ESLint changes**: Run `pnpm lint` to ensure no breaking changes
3. **Husky requires git**: Make sure changes are committed before testing hooks
4. **API standardization is optional**: The utility can be used incrementally on new routes

---

## Total New Tasks: 12

**Estimated implementation time:** 1-2 hours

---

## Summary of All Improvements (V1 + V2 + V3)

| Plan | Tasks | Status |
|------|-------|--------|
| IMPROVEMENT_PLAN.md | 17 | ✅ Complete |
| IMPROVEMENT_PLAN_V2.md | 18 | ✅ Complete |
| IMPROVEMENT_PLAN_V3.md | 12 | ⏳ Pending |
| **Total** | **47** | **35 complete, 12 pending** |

After V3 completion, the codebase will have:
- ✅ Centralized logging (no console statements)
- ✅ Full type safety (no `any` types in production)
- ✅ React Query for all data fetching
- ✅ Reusable UI components
- ✅ SEO optimization (sitemap, robots, manifest)
- ✅ Accessibility features
- ✅ Code formatting with Prettier
- ✅ Pre-commit quality checks
- ✅ Standardized API responses

# ESLint Strict Mode Configuration

## Overview
The ESLint configuration has been upgraded to **STRICT MODE** to prevent poorly typed code and maintain high code quality standards.

## Changes Made

### 1. ESLint Configuration (`.eslintrc.json` & `eslint.config.mjs`)

#### Previously (Warnings)
- `@typescript-eslint/no-explicit-any`: **warn** ⚠️
- `no-console`: **warn** ⚠️  
- `react-hooks/exhaustive-deps`: **warn** ⚠️
- `@next/next/no-img-element`: **warn** ⚠️
- `@typescript-eslint/ban-ts-comment`: **warn** ⚠️

#### Now (Errors - STRICT)
- `@typescript-eslint/no-explicit-any`: **error** ❌ (No `any` types allowed)
- `no-console`: **error** ❌ (Only `console.warn` and `console.error` allowed)
- `react-hooks/exhaustive-deps`: **error** ❌ (All hook dependencies must be declared)
- `@next/next/no-img-element`: **error** ❌ (Must use Next.js `<Image>` component)
- `@typescript-eslint/ban-ts-comment`: **error** ❌ (No `@ts-ignore` or `@ts-nocheck` allowed)

### 2. TypeScript Configuration (`tsconfig.json`)

Added strict compiler options:
- `noUncheckedIndexedAccess`: true - Array/object indexing returns `T | undefined`
- `noImplicitReturns`: true - All code paths must return a value
- `noFallthroughCasesInSwitch`: true - Switch cases must break/return
- `noUnusedLocals`: true - No unused local variables
- `noUnusedParameters`: true - No unused function parameters
- `forceConsistentCasingInFileNames`: true - Enforce consistent file naming

### 3. Pre-commit Hooks

Husky + lint-staged is configured to run ESLint on all staged files before commit.

**This means:**
- ❌ Commits will **FAIL** if any ESLint errors exist
- ✅ Only clean, properly typed code can be committed
- 🔒 Prevents accumulation of technical debt

## Current Status

### Errors That Must Be Fixed

The following issues are now **blocking errors** that must be fixed:

1. **54 instances of `any` type** across multiple files:
   - `src/app/api/` - API route handlers
   - `src/app/components/` - React components
   - `src/hooks/` - Custom hooks
   - `src/lib/` - Utility functions
   - `src/services/` - Service layer
   - `src/types/` - Type definitions

2. **3 instances of `<img>` tag** that should use Next.js `<Image>`:
   - `src/app/components/candidate-table/CandidateTableRow.tsx`
   - `src/app/components/profile-modal/ProfileHeader.tsx`
   - `src/app/components/__tests__/CandidateForm.test.tsx`

3. **4 instances of `console.log`** in `src/lib/logger.ts` that should be removed

4. **6 React Hook dependency warnings** in:
   - `src/hooks/useCandidateForm.ts`
   - `src/hooks/useDashboard.ts`
   - `src/hooks/useEditCandidateForm.ts`

### Total: ~67 errors that must be fixed before any new commits

## How to Check for Errors

```bash
# Run ESLint
pnpm lint

# Run ESLint with auto-fix (fixes simple issues)
pnpm lint --fix

# Check TypeScript types
pnpm type-check
```

## Benefits of Strict Mode

### ✅ Code Quality
- Eliminates `any` types that bypass type safety
- Enforces proper TypeScript usage
- Catches bugs at compile time, not runtime

### ✅ Maintainability
- Code is self-documenting with proper types
- Easier refactoring with confidence
- Better IDE autocomplete and intellisense

### ✅ Team Collaboration
- Consistent code standards
- No "bad code" sneaking into the codebase
- Pull requests are pre-validated

### ✅ Performance
- Next.js Image optimization enforced
- No console.log spam in production
- Proper React Hook dependencies prevent unnecessary re-renders

## How to Fix Common Issues

### 1. Replace `any` with Proper Types

❌ **Before (Error):**
```typescript
function handleData(data: any) {
  return data.value;
}
```

✅ **After (Fixed):**
```typescript
interface DataType {
  value: string;
}

function handleData(data: DataType) {
  return data.value;
}
```

### 2. Use `unknown` for Truly Unknown Types

❌ **Before (Error):**
```typescript
catch (error: any) {
  console.log(error.message);
}
```

✅ **After (Fixed):**
```typescript
catch (error: unknown) {
  if (error instanceof Error) {
    logger.error('Error occurred', error);
  }
}
```

### 3. Replace `<img>` with Next.js `<Image>`

❌ **Before (Error):**
```tsx
<img src={photoUrl} alt="Profile" className="w-20" />
```

✅ **After (Fixed):**
```tsx
import Image from 'next/image';

<Image 
  src={photoUrl} 
  alt="Profile" 
  width={80} 
  height={80} 
  className="w-20" 
/>
```

### 4. Remove console.log

❌ **Before (Error):**
```typescript
console.log('Debug info:', data);
```

✅ **After (Fixed):**
```typescript
import logger from '@/lib/logger';

logger.info('Debug info', { data });
```

### 5. Fix React Hook Dependencies

❌ **Before (Error):**
```typescript
useEffect(() => {
  validatePhoneNumber(phone);
}, [phone]); // Missing: validatePhoneNumber
```

✅ **After (Fixed):**
```typescript
const validatePhoneNumber = useCallback((phone: string) => {
  // validation logic
}, []);

useEffect(() => {
  validatePhoneNumber(phone);
}, [phone, validatePhoneNumber]);
```

Or use ESLint disable if truly intentional:
```typescript
useEffect(() => {
  validatePhoneNumber(phone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [phone]);
```

## Roadmap to Clean Code

### Phase 1: Fix Existing Errors (Priority: HIGH)
1. ✅ Configure strict ESLint rules
2. ⏳ Fix all 54 `any` type errors
3. ⏳ Replace 3 `<img>` tags with `<Image>`
4. ⏳ Remove 4 `console.log` statements
5. ⏳ Fix 6 React Hook dependency errors

### Phase 2: Gradual Type Improvement (Priority: MEDIUM)
- Add proper interfaces for API responses
- Type all event handlers properly
- Remove `as` type assertions where possible
- Add JSDoc comments for complex functions

### Phase 3: Advanced Type Safety (Priority: LOW)
- Enable `@typescript-eslint/no-unsafe-*` rules with type-aware linting
- Add `@typescript-eslint/explicit-function-return-type` for public APIs
- Consider `@typescript-eslint/strict-boolean-expressions`

## Testing Strategy

Before committing:
1. ✅ Run `pnpm lint` - Must pass with 0 errors
2. ✅ Run `pnpm type-check` - TypeScript must compile
3. ✅ Run `pnpm test` - All tests must pass
4. ✅ Pre-commit hook runs automatically

## Exceptions

Test files (`**/__tests__/**`, `*.test.ts`) have relaxed rules:
- `@typescript-eslint/no-explicit-any`: **off**
- `@typescript-eslint/no-unused-vars`: **off**
- `no-console`: **off**

This allows for flexible mocking and debugging in tests.

## Notes

- **Breaking change**: All `any` types must be replaced before committing
- **Migration**: Existing code with errors must be fixed incrementally
- **Support**: Use `unknown` or proper types, never disable the rule globally
- **Documentation**: Update this file as rules evolve

---

**Last Updated**: November 26, 2025
**Status**: ACTIVE - Strict mode enforced on all commits

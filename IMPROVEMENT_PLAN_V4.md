# Codebase Improvement Plan V4

**Created:** 2025-11-29  
**Branch:** general-enhancements-7  
**Scope:** Code quality, performance, and organization improvements (excluding database, TODOs, and CORS)

---

## Task 1: Fix Unused Specialty Filter in useDashboard

**Priority:** P2 - Medium  
**Effort:** Low  
**Files:** `src/hooks/useDashboard.ts`

### Problem
The `_specialtyMatch` variable is computed but not included in the final filter return statement, meaning specialty filtering doesn't work.

### Solution
Change `_specialtyMatch` to `specialtyMatch` and include it in the filter chain.

### Implementation
```typescript
// In filteredCandidates useMemo, change:
const _specialtyMatch = ...
// To:
const specialtyMatch = ...

// And add to the return statement:
return (
  statusMatch &&
  nameMatch &&
  cityMatch &&
  countryMatch &&
  nationalityMatch &&
  jobTitleMatch &&
  categoryMatch &&
  specialtyMatch &&  // Add this
  ageMatch &&
  tabMatch
);
```

### Tests
- Verify existing tests pass
- Add test case for specialty filtering if not covered

---

## Task 2: Consolidate Candidate Fetching Logic

**Priority:** P2 - Medium  
**Effort:** Medium  
**Files:** 
- `src/hooks/useCandidates.ts`
- `src/hooks/useDashboard.ts`

### Problem
Both hooks contain identical Firestore subscription logic for fetching candidates, violating DRY principle.

### Solution
Refactor `useDashboard` to use `useCandidates` internally instead of duplicating the subscription logic.

### Implementation
```typescript
// In useDashboard.ts, replace the candidates fetching useEffect with:
import { useCandidates } from './useCandidates';

// Inside useDashboard:
const { candidates: fetchedCandidates, loadingCandidates: fetchLoading } = useCandidates(user);
const [candidates, setCandidates] = useState<Candidate[]>([]);
const [loadingCandidates, setLoadingCandidates] = useState(true);

// Handle mock mode separately in useEffect
useEffect(() => {
  if (useMock) {
    // mock data logic
  } else {
    setCandidates(fetchedCandidates);
    setLoadingCandidates(fetchLoading);
  }
}, [fetchedCandidates, fetchLoading, useMock]);
```

### Tests
- Ensure useDashboard tests still pass
- Verify real-time updates still work

---

## Task 3: Add Environment Variable Validation

**Priority:** P3 - Low  
**Effort:** Low  
**Files:** 
- `src/lib/env-validation.ts` (new file)
- `src/app/layout.tsx` or appropriate entry point

### Problem
Environment variables are checked inline when used. Missing critical vars should fail fast at startup.

### Solution
Create a validation module that checks required environment variables and warns/errors appropriately.

### Implementation
```typescript
// src/lib/env-validation.ts
type EnvVarConfig = {
  name: string;
  required: boolean;
  description: string;
};

const ENV_VARS: EnvVarConfig[] = [
  { name: 'FIREBASE_PROJECT_ID', required: true, description: 'Firebase project ID' },
  { name: 'FIREBASE_CLIENT_EMAIL', required: true, description: 'Firebase admin email' },
  { name: 'FIREBASE_PRIVATE_KEY', required: true, description: 'Firebase private key' },
  { name: 'NEXT_PUBLIC_FIREBASE_API_KEY', required: true, description: 'Firebase client API key' },
  { name: 'SMTP_HOST', required: false, description: 'SMTP server for emails' },
  { name: 'GEMINI_API_KEY', required: false, description: 'Gemini AI for scoring' },
  // Add more as needed
];

export function validateEnvironment(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  for (const envVar of ENV_VARS) {
    if (!process.env[envVar.name]) {
      if (envVar.required) {
        missing.push(`${envVar.name}: ${envVar.description}`);
      } else {
        warnings.push(`${envVar.name}: ${envVar.description} (optional)`);
      }
    }
  }
  
  return { valid: missing.length === 0, missing, warnings };
}
```

### Tests
- Unit test for validateEnvironment function
- Test with missing required vars
- Test with missing optional vars

---

## Task 4: Split useDashboard Hook

**Priority:** P4 - Low  
**Effort:** Medium-High  
**Files:**
- `src/hooks/useDashboard.ts` (refactor)
- `src/hooks/useDashboardFilters.ts` (new)
- `src/hooks/useDashboardModals.ts` (new)
- `src/hooks/useDashboardToast.ts` (new)

### Problem
`useDashboard.ts` is 350+ lines handling auth, data fetching, filtering, modals, and toasts. This violates single responsibility principle.

### Solution
Split into smaller, composable hooks:
1. `useDashboardFilters` - All filter state and logic
2. `useDashboardModals` - Modal state management
3. `useDashboardToast` - Toast notifications
4. Keep `useDashboard` as the composer

### Implementation

#### useDashboardFilters.ts
```typescript
export const useDashboardFilters = (candidates: Candidate[], activeTab: string) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterName, setFilterName] = useState<string>('');
  // ... all filter states
  
  const filteredCandidates = useMemo(() => {
    // filtering logic
  }, [candidates, ...filterDeps]);
  
  const clearAllFilters = () => { /* ... */ };
  
  return {
    filterStatus, setFilterStatus,
    // ... all filter state and setters
    filteredCandidates,
    clearAllFilters,
  };
};
```

#### useDashboardModals.ts
```typescript
export const useDashboardModals = () => {
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // ... all modal states
  
  const openScoringModal = (candidate: Candidate) => { /* ... */ };
  const closeScoringModal = () => { /* ... */ };
  // ... all modal handlers
  
  return {
    // modal states and handlers
  };
};
```

#### useDashboardToast.ts
```typescript
export const useDashboardToast = () => {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', isVisible: false });
  
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 5000);
  };
  
  return { toast, showToast, setToast };
};
```

#### Refactored useDashboard.ts
```typescript
export const useDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { candidates, loadingCandidates } = useCandidates(user);
  const [activeTab, setActiveTab] = useState<string>('main');
  
  const filters = useDashboardFilters(candidates, activeTab);
  const modals = useDashboardModals();
  const { toast, showToast } = useDashboardToast();
  
  // Calendar and stats logic remains here
  
  return {
    user, authLoading, signOut,
    candidates, loadingCandidates,
    activeTab, setActiveTab,
    ...filters,
    ...modals,
    toast, showToast,
    // calendar and stats
  };
};
```

### Tests
- Update existing useDashboard tests
- Add tests for each new hook
- Ensure integration still works

---

## Execution Order

1. **Task 1** - Quick fix, immediate impact on functionality
2. **Task 3** - Low effort, improves developer experience
3. **Task 2** - Medium effort, reduces code duplication
4. **Task 4** - Higher effort, best done last as it's refactoring

---

## Verification Checklist

After each task:
- [ ] Run `pnpm test` - all tests pass
- [ ] Run `pnpm lint` - no ESLint errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual smoke test of affected features

---

## Notes

- All changes should maintain backward compatibility
- Do not modify database schemas or CORS configuration
- Follow existing code patterns and TypeScript strict mode
- Update or add tests for all changes

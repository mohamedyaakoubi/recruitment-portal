# E2E Test Implementation Plan

## Overview
Complete end-to-end test coverage for the International Skills Career Portal using Playwright.

---

## Phase 1: Test Infrastructure Setup

### 1.1 Create Test Utilities and Helpers

**File: `e2e/utils/test-helpers.ts`**
```typescript
// Helper functions for common test operations
- generateTestEmail(): Generate unique test emails
- generateTestCandidate(): Create mock candidate data
- waitForToast(): Wait for success/error toasts
- clearLocalStorage(): Clean up between tests
```

**File: `e2e/utils/auth-helpers.ts`**
```typescript
// Firebase authentication helpers
- loginAsAdmin(page): Authenticate as admin user
- setupAuthState(page): Set up authentication cookies/tokens
- mockFirebaseAuth(): Mock Firebase auth for testing
```

**File: `e2e/fixtures/test-data.ts`**
```typescript
// Test data fixtures
- testCandidates: Array of mock candidate objects
- testJobs: Array of mock job listings
- testAdmin: Admin user credentials (from env vars)
```

### 1.2 Environment Configuration

**File: `e2e/.env.test`**
```
TEST_ADMIN_EMAIL=test-admin@example.com
TEST_ADMIN_PASSWORD=<secure-password>
TEST_BASE_URL=http://localhost:3000
```

**Update: `playwright.config.ts`**
- Add global setup for authentication
- Configure test project for authenticated vs public tests
- Add screenshot and video retention settings

---

## Phase 2: Public Pages E2E Tests (No Auth Required)

### 2.1 Landing Page Tests
**File: `e2e/landing-page.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Display hero section | Verify "Your Career Journey" heading, subtitle |
| Display email form | Email input, Continue button, validation |
| Show features section | Global Opportunities, Verified Process, Fast Track |
| Show header elements | Logo, theme toggle, contact info banner |
| Show footer | Contact info, social links, copyright |
| Theme switching | Light/dark mode toggle works |
| Responsive design | Mobile viewport displays correctly |

### 2.2 Email Validation Flow
**File: `e2e/email-flow.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Reject empty email | Show error for empty submission |
| Reject invalid format | Show error for "invalid-email" |
| Handle new email | Redirect to /candidate-form for new users |
| Handle existing email | Redirect to /candidate-choices for existing users |
| Show loading state | Button shows "Checking..." during API call |
| Handle API errors | Display error message gracefully |

---

## Phase 3: Candidate Form E2E Tests

### 3.1 Form Navigation & Validation
**File: `e2e/candidate-form.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Load form with email | Pre-fill email from query param |
| Validate required fields | Show errors for missing required fields |
| Personal info section | Name, DOB, nationality, gender validation |
| Contact info section | Phone validation with country code |
| Job selection | Category dropdown, job position selection |
| Location info | Current location, source dropdowns |
| Additional info | Specialty, comment fields |

### 3.2 File Upload Tests
**File: `e2e/candidate-form-uploads.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Upload CV (PDF) | Accept PDF file, show preview |
| Upload photo | Accept image file, show preview |
| Reject invalid file type | Show error for wrong file types |
| Reject oversized file | Show error for files > limit |
| Remove uploaded file | Clear uploaded file |

### 3.3 Form Submission
**File: `e2e/candidate-form-submit.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Submit valid form | Complete form submission, show success |
| Redirect after submit | Navigate to candidate dashboard |
| Handle duplicate email | Show appropriate error |
| Handle server errors | Display error gracefully |

---

## Phase 4: Candidate Dashboard E2E Tests

### 4.1 Dashboard Display
**File: `e2e/candidate-dashboard.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Display welcome section | Show candidate name, email |
| Display application status | Status badge, submission date |
| Display job details | Applied position, category |
| Display interview details | Date, time, Meet link (if scheduled) |
| Display help section | Contact information |

### 4.2 Candidate Choices
**File: `e2e/candidate-choices.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Show existing applications | List of submitted applications |
| View application details | Click to view specific application |
| Apply for new job | Option to submit new application |

---

## Phase 5: Admin Dashboard E2E Tests (Requires Auth)

### 5.1 Authentication Setup
**File: `e2e/admin-auth.setup.ts`**
```typescript
// Global setup to authenticate admin user
// Save auth state to storageState for reuse
```

### 5.2 Admin Login Tests
**File: `e2e/admin-login.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Display login page | Google sign-in button visible |
| Redirect unauthenticated | Redirect to login if not authenticated |
| Successful login | Navigate to dashboard after login |
| Invalid credentials | Handle auth errors |

### 5.3 Candidate Table Tests
**File: `e2e/admin-candidate-table.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Display candidate list | Table with candidate data |
| Pagination | Navigate between pages |
| Search by name | Filter candidates by name |
| Filter by status | Filter by submitted/interview/hired/rejected |
| Filter by job category | Filter by job type |
| Sort by date | Sort by submission date |
| Sort by name | Alphabetical sorting |

### 5.4 Candidate Profile Modal
**File: `e2e/admin-profile-modal.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Open profile modal | Click candidate row to open |
| Display personal info | Name, email, phone, DOB, nationality |
| Display job info | Position, category, specialty |
| Display documents | CV link, photo |
| Display websites | Social links if provided |
| Close modal | X button, outside click |

### 5.5 Candidate Actions
**File: `e2e/admin-candidate-actions.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Edit candidate | Open edit modal, modify fields, save |
| Update status | Change status dropdown, confirm |
| Delete candidate | Delete with confirmation |
| View CV | Open CV in new tab |
| Copy email | Copy email to clipboard |

### 5.6 Interview Scheduling
**File: `e2e/admin-interview.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Schedule interview | Select date/time, duration |
| Create Google Meet | Generate Meet link |
| Send confirmation email | Email sent to candidate |
| Cancel interview | Cancel with confirmation |
| Reschedule interview | Change interview date/time |
| Calendar display | Show scheduled interviews on calendar |

### 5.7 AI Scoring
**File: `e2e/admin-scoring.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Trigger AI scoring | Click score button |
| Display loading state | Show scoring progress |
| Display score result | Show score and analysis |
| Handle scoring errors | Display error gracefully |

### 5.8 Export Functionality
**File: `e2e/admin-export.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Export to CSV | Download CSV file |
| Export to Excel | Download XLSX file |
| Export filtered data | Only export visible/filtered candidates |

### 5.9 Dashboard Statistics
**File: `e2e/admin-dashboard-stats.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Display stats cards | Total, submitted, interview, hired counts |
| Display status chart | Pie chart with status distribution |
| Display score chart | Bar chart with score distribution |
| Refresh stats | Update when data changes |

### 5.10 Job Management
**File: `e2e/admin-jobs.spec.ts`**

| Test Case | Description |
|-----------|-------------|
| Display job list | Table with job listings |
| Add new job | Create job with title, category, description |
| Edit job | Modify existing job |
| Delete job | Remove job with confirmation |
| Toggle job status | Active/inactive toggle |

---

## Phase 6: Cross-Browser & Responsive Tests

### 6.1 Browser Compatibility
**File: `e2e/cross-browser.spec.ts`**

| Browser | Tests |
|---------|-------|
| Chromium | All critical paths |
| Firefox | All critical paths |
| WebKit (Safari) | All critical paths |

### 6.2 Responsive Design
**File: `e2e/responsive.spec.ts`**

| Viewport | Tests |
|----------|-------|
| Mobile (375px) | Landing, form, dashboard |
| Tablet (768px) | Landing, form, dashboard |
| Desktop (1280px) | Full functionality |

---

## Implementation Order & Priority

### Priority 1 (Critical Path)
1. `e2e/utils/*` - Test infrastructure
2. `e2e/landing-page.spec.ts` - Entry point
3. `e2e/email-flow.spec.ts` - User flow start
4. `e2e/candidate-form.spec.ts` - Core functionality

### Priority 2 (Main Features)
5. `e2e/candidate-form-submit.spec.ts`
6. `e2e/candidate-dashboard.spec.ts`
7. `e2e/admin-auth.setup.ts`
8. `e2e/admin-candidate-table.spec.ts`

### Priority 3 (Admin Features)
9. `e2e/admin-profile-modal.spec.ts`
10. `e2e/admin-candidate-actions.spec.ts`
11. `e2e/admin-interview.spec.ts`
12. `e2e/admin-scoring.spec.ts`

### Priority 4 (Secondary Features)
13. `e2e/admin-export.spec.ts`
14. `e2e/admin-dashboard-stats.spec.ts`
15. `e2e/admin-jobs.spec.ts`
16. `e2e/candidate-choices.spec.ts`

### Priority 5 (Quality Assurance)
17. `e2e/cross-browser.spec.ts`
18. `e2e/responsive.spec.ts`

---

## Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/landing-page.spec.ts

# Run with UI mode (debugging)
npm run test:e2e:ui

# Run only Chromium
npx playwright test --project=chromium

# Run with headed browser (visible)
npx playwright test --headed

# Generate test report
npx playwright show-report
```

---

## Estimated Test Count

| Phase | Files | Tests |
|-------|-------|-------|
| Phase 2 (Public) | 2 | ~15 |
| Phase 3 (Form) | 3 | ~20 |
| Phase 4 (Candidate) | 2 | ~10 |
| Phase 5 (Admin) | 10 | ~60 |
| Phase 6 (Cross-browser) | 2 | ~15 |
| **Total** | **19** | **~120** |

---

## Notes for Implementation

1. **Use Page Object Model (POM)** - Create page objects for reusable selectors
2. **Test isolation** - Each test should be independent
3. **Data cleanup** - Reset test data between runs
4. **Retry logic** - Configure retries for flaky tests
5. **CI/CD integration** - Tests should run in GitHub Actions
6. **Environment variables** - Never commit real credentials
7. **Screenshots on failure** - Already configured in playwright.config.ts
8. **Parallel execution** - Tests should be parallelizable

---

## Dependencies

Ensure these are installed:
```bash
pnpm add -D @playwright/test
npx playwright install
```

Current versions:
- `@playwright/test`: ^1.56.1
- Browsers: Chromium, Firefox, WebKit (installed)

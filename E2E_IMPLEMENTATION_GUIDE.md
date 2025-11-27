# E2E Test Implementation Guide

## ✅ Completed Components

### Phase 1: Test Infrastructure (Complete)
- ✅ **Test Utilities** (`e2e/utils/test-helpers.ts`)
  - Helper functions for common operations
  - Data generation utilities
  - Toast and storage management
  - Form filling and file upload helpers
  
- ✅ **Authentication Helpers** (`e2e/utils/auth-helpers.ts`)
  - Firebase authentication mocking
  - Admin login functionality
  - Auth state management
  
- ✅ **Test Fixtures** (`e2e/fixtures/test-data.ts`)
  - Mock candidate data
  - Mock job listings
  - Test file paths
  - Common selectors and routes
  
- ✅ **Page Object Models**
  - `e2e/pages/landing-page.ts` - Landing page interactions
  - `e2e/pages/candidate-form-page.ts` - Form interactions
  - `e2e/pages/admin-dashboard-page.ts` - Admin dashboard interactions

- ✅ **Global Setup** (`e2e/global-setup.ts`)
  - Admin authentication setup
  - Storage state management

### Phase 2: Public Pages Tests (Complete)
- ✅ **Landing Page Tests** (`e2e/landing-page.spec.ts`)
  - Hero section display
  - Email form validation
  - Features section
  - Header and footer
  - Theme toggle
  - Responsive design
  - SEO and accessibility

- ✅ **Email Flow Tests** (`e2e/email-flow.spec.ts`)
  - Empty email validation
  - Invalid email format
  - New email handling
  - Existing email handling
  - Loading states
  - API error handling
  - Edge cases

### Phase 3: Candidate Form Tests (Complete)
- ✅ **Form Validation Tests** (`e2e/candidate-form.spec.ts`)
  - Email pre-fill
  - Required field validation
  - Personal info validation
  - Contact info validation
  - Job selection
  - Responsive design

- ✅ **File Upload Tests** (`e2e/candidate-form-uploads.spec.ts`)
  - CV upload
  - Photo upload
  - File previews
  - File removal
  - Invalid file type handling
  - Multiple uploads

- ✅ **Form Submission Tests** (`e2e/candidate-form-submit.spec.ts`)
  - Successful submission
  - Redirect after submission
  - Duplicate email handling
  - Server error handling
  - Network timeout handling
  - Data preservation

### Phase 5: Admin Dashboard Tests (Partial)
- ✅ **Candidate Table Tests** (`e2e/admin-candidate-table.spec.ts`)
  - Table display
  - Search functionality
  - Filtering by status and category
  - Pagination
  - Sorting
  - Profile modal
  - Statistics display

---

## 📋 Remaining Implementation Tasks

### Phase 4: Candidate Dashboard Tests
Create the following test files:

#### `e2e/candidate-dashboard.spec.ts`
```typescript
// Test cases to implement:
- Display welcome section with candidate name and email
- Display application status badge
- Display job details (position, category)
- Display interview details (date, time, Meet link)
- Display help section with contact information
- Responsive design testing
```

#### `e2e/candidate-choices.spec.ts`
```typescript
// Test cases to implement:
- Show list of existing applications
- View application details
- Apply for new job option
- Navigate between applications
```

### Phase 5: Admin Dashboard Tests (Remaining)

#### `e2e/admin-auth.setup.ts`
```typescript
// Setup file for admin authentication
// Use the global-setup.ts as reference
```

#### `e2e/admin-login.spec.ts`
```typescript
// Test cases to implement:
- Display login page with Google sign-in button
- Redirect unauthenticated users to login
- Successful login navigation
- Invalid credentials handling
```

#### `e2e/admin-profile-modal.spec.ts`
```typescript
// Test cases to implement:
- Open profile modal on candidate row click
- Display personal information
- Display job information
- Display documents (CV link, photo)
- Display social media links
- Close modal (X button, outside click)
```

#### `e2e/admin-candidate-actions.spec.ts`
```typescript
// Test cases to implement:
- Edit candidate information
- Update candidate status
- Delete candidate with confirmation
- View CV in new tab
- Copy email to clipboard
```

#### `e2e/admin-interview.spec.ts`
```typescript
// Test cases to implement:
- Schedule interview (date, time, duration)
- Create Google Meet link
- Send confirmation email
- Cancel interview
- Reschedule interview
- Display interviews on calendar
```

#### `e2e/admin-scoring.spec.ts`
```typescript
// Test cases to implement:
- Trigger AI scoring
- Display loading state during scoring
- Display score result and analysis
- Handle scoring errors gracefully
```

#### `e2e/admin-export.spec.ts`
```typescript
// Test cases to implement:
- Export candidates to CSV
- Export candidates to Excel
- Export filtered data only
- Verify download file format
```

#### `e2e/admin-dashboard-stats.spec.ts`
```typescript
// Test cases to implement:
- Display statistics cards (total, submitted, interview, hired)
- Display status distribution pie chart
- Display score distribution bar chart
- Refresh statistics when data changes
```

#### `e2e/admin-jobs.spec.ts`
```typescript
// Test cases to implement:
- Display job listings table
- Add new job
- Edit existing job
- Delete job with confirmation
- Toggle job active/inactive status
```

### Phase 6: Cross-Browser & Responsive Tests

#### `e2e/cross-browser.spec.ts`
```typescript
// Test critical paths across browsers:
- Chromium: Full test suite
- Firefox: Critical user flows
- WebKit: Critical user flows
```

#### `e2e/responsive.spec.ts`
```typescript
// Test responsive design:
- Mobile (375px): Landing, form, dashboard
- Tablet (768px): Landing, form, dashboard
- Desktop (1280px): Full functionality
```

---

## 🚀 Running the Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test e2e/landing-page.spec.ts
```

### Run with UI Mode (Debugging)
```bash
npm run test:e2e:ui
```

### Run Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run in Headed Mode (Visible Browser)
```bash
npx playwright test --headed
```

### Generate Test Report
```bash
npx playwright show-report
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

---

## 📝 Test Writing Guidelines

### 1. Use Page Object Models
Always use the Page Object Models for interactions:
```typescript
import { LandingPage } from './pages/landing-page';

test('example test', async ({ page }) => {
  const landingPage = new LandingPage(page);
  await landingPage.goto();
  await landingPage.submitEmail('test@example.com');
});
```

### 2. Use Test Helpers
Leverage the helper functions:
```typescript
import { generateTestEmail, waitForToast } from './utils/test-helpers';

const email = generateTestEmail();
await waitForToast(page, 'success');
```

### 3. Use Test Fixtures
Use predefined test data:
```typescript
import { testCandidates, testData } from './fixtures/test-data';

const candidate = testCandidates[0];
```

### 4. Handle Async Operations
Always wait for operations to complete:
```typescript
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500); // For debounced inputs
await page.waitForURL('**/expected-url**');
```

### 5. Handle Errors Gracefully
Use try-catch or .catch() for operations that might fail:
```typescript
const isVisible = await element.isVisible().catch(() => false);
```

### 6. Test Isolation
Each test should be independent:
```typescript
test.beforeEach(async ({ page }) => {
  // Set up clean state
  await clearLocalStorage(page);
  await clearCookies(page);
});
```

### 7. Descriptive Test Names
Use clear, descriptive test names:
```typescript
test('should display error message when submitting empty email', async () => {
  // Test implementation
});
```

---

## 🔧 Configuration

### Environment Variables
Create `e2e/.env.test` file (gitignored):
```env
TEST_ADMIN_EMAIL=your-admin-email@example.com
TEST_ADMIN_PASSWORD=your-secure-password
TEST_BASE_URL=http://localhost:3000
```

### Playwright Configuration
The `playwright.config.ts` is already configured with:
- Global setup for authentication
- Three browser projects (Chromium, Firefox, WebKit)
- Screenshots on failure
- Video recording on failure
- Automatic dev server startup

---

## 🐛 Debugging Tips

### 1. Use Playwright Inspector
```bash
npx playwright test --debug
```

### 2. Take Screenshots
```typescript
await page.screenshot({ path: 'debug-screenshot.png' });
```

### 3. Console Logging
```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

### 4. Slow Down Execution
```typescript
await page.waitForTimeout(1000); // Add delays to observe
```

### 5. Use Playwright Trace Viewer
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

---

## ✅ Test Coverage Summary

### Completed: ~60 tests
- Landing Page: 14 tests
- Email Flow: 13 tests
- Candidate Form: 13 tests
- File Uploads: 15 tests
- Form Submission: 13 tests
- Admin Table: 16 tests

### Remaining: ~60 tests
- Candidate Dashboard: ~10 tests
- Candidate Choices: ~5 tests
- Admin Login: ~4 tests
- Admin Profile Modal: ~6 tests
- Admin Actions: ~5 tests
- Admin Interview: ~6 tests
- Admin Scoring: ~4 tests
- Admin Export: ~3 tests
- Admin Stats: ~4 tests
- Admin Jobs: ~5 tests
- Cross-Browser: ~5 tests
- Responsive: ~3 tests

---

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Debugging Tests](https://playwright.dev/docs/debug)

---

## 🎯 Next Steps

1. **Create remaining test files** following the patterns established
2. **Run tests locally** to verify they work
3. **Fix any failing tests** by adjusting selectors or logic
4. **Add CI/CD integration** to run tests on every commit
5. **Monitor test coverage** and add tests for edge cases
6. **Maintain tests** as the application evolves

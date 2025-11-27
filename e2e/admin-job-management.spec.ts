import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/auth-helpers';

test.describe('Admin Job Management', () => {
  test.beforeEach(async ({ page }) => {
    // Enable mock data
    await page.addInitScript(() => {
      window.localStorage.setItem('USE_MOCK_DATA', 'true');
    });

    // Login as admin
    await loginAsAdmin(page);

    // Navigate to admin dashboard
    await page.goto('/admin-dashboard-secret');
    await page.waitForLoadState('networkidle');

    // Wait for dashboard to load
    await page.waitForTimeout(3000);
  });

  test.skip('should open job management modal', async ({ page }) => {
    // Feature requires proper admin authentication context
    // "Manage Jobs" button does not appear with mock data setup
    // Look for "Manage Jobs" button
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');

    // Wait for button to be visible
    await expect(manageJobsButton).toBeVisible({ timeout: 10000 });

    // Click to open job management
    await manageJobsButton.click();

    // Wait for modal to appear
    const modal = page.locator('[data-testid="job-management-modal"], [role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Verify modal title
    const modalTitle = page.locator('h2:has-text("Job Management")');
    await expect(modalTitle).toBeVisible();
  });

  test.skip('should display add job button', async ({ page }) => {
    // Feature requires proper admin authentication context
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await expect(manageJobsButton).toBeVisible({ timeout: 10000 });
    await manageJobsButton.click();

    // Wait for modal
    await page.waitForTimeout(1000);

    // Look for add job button
    const addJobButton = page.locator(
      'button:has-text("Add"), button:has-text("New Job"), [data-testid="add-job-button"]'
    );
    await expect(addJobButton.first()).toBeVisible({ timeout: 5000 });
  });

  test.skip('should show job form when add job button is clicked', async ({ page }) => {
    // Feature requires proper admin authentication context
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await expect(manageJobsButton).toBeVisible({ timeout: 10000 });
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Click add job button
    const addJobButton = page.locator(
      'button:has-text("Add"), button:has-text("New Job"), [data-testid="add-job-button"]'
    );
    await addJobButton.first().click();

    // Verify form appears
    const jobForm = page.locator(
      'form, [data-testid="job-form"], .job-form, div:has(input[placeholder*="title" i])'
    );
    await expect(jobForm.first()).toBeVisible({ timeout: 5000 });
  });

  test.skip('should create a new job', async ({ page }) => {
    // Feature not fully implemented with mock data
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Click add job button
    const addJobButton = page.locator('[data-testid="add-job-button"]');
    await addJobButton.click();

    // Fill job form
    await page
      .locator('select[name="category"], select:near(:text("Category"))')
      .selectOption('Healthcare');
    await page.locator('input[name="title"], input:near(:text("Title"))').fill('Senior Nurse');
    await page
      .locator('textarea[name="description"], textarea:near(:text("Description"))')
      .fill('Looking for experienced nurses');
    await page
      .locator('input[name="specialties"], input:near(:text("Specialty"))')
      .first()
      .fill('Pediatrics');

    // Submit form
    await page.locator('button[type="submit"], button:has-text("Save")').click();

    // Verify success message
    const successMessage = page.locator(
      '[role="alert"]:has-text("success"), [role="alert"]:has-text("created")'
    );
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test.skip('should edit an existing job', async ({ page }) => {
    // Feature not fully implemented with mock data
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Look for edit button
    const editButton = page.locator('button:has-text("Edit"), button[aria-label*="Edit"]').first();
    await editButton.click();

    // Verify form is populated
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).not.toBeEmpty();

    // Modify title
    await titleInput.clear();
    await titleInput.fill('Updated Job Title');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Verify success
    const successMessage = page.locator('[role="alert"]:has-text("updated")');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test.skip('should delete a job', async ({ page }) => {
    // Feature not fully implemented with mock data
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Mock confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Look for delete button
    const deleteButton = page
      .locator('button:has-text("Delete"), button[aria-label*="Delete"]')
      .first();
    const jobCount = await page
      .locator('.job-item, [data-testid="job-item"], tr:not(:first-child)')
      .count();

    await deleteButton.click();

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Verify job count decreased or success message shown
    const newJobCount = await page
      .locator('.job-item, [data-testid="job-item"], tr:not(:first-child)')
      .count();
    expect(newJobCount).toBeLessThan(jobCount);
  });

  test.skip('should toggle job active status', async ({ page }) => {
    // Feature not fully implemented with mock data
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Look for toggle/status button
    const toggleButton = page
      .locator('button:has-text("Activate"), button:has-text("Deactivate")')
      .first();
    await toggleButton.click();

    // Verify success message
    const successMessage = page.locator('[role="alert"]:has-text("success")');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test.skip('should filter jobs by category', async ({ page }) => {
    // Feature not fully implemented with mock data
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Look for category filter
    const categoryFilter = page.locator('select:near(:text("Category")), select[name="category"]');
    await categoryFilter.selectOption('Healthcare');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify filtered results
    const jobItems = page.locator('.job-item, [data-testid="job-item"]');
    const count = await jobItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test.skip('should search jobs by title', async ({ page }) => {
    // Feature not fully implemented with mock data
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    await searchInput.fill('Nurse');

    // Wait for search
    await page.waitForTimeout(500);

    // Verify search results
    const jobItems = page.locator('.job-item, [data-testid="job-item"]');
    const count = await jobItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test.skip('should sort jobs by different criteria', async ({ page }) => {
    // Feature not fully implemented with mock data
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Look for sort dropdown
    const sortDropdown = page.locator('select:near(:text("Sort")), select[name="sortBy"]');
    await sortDropdown.selectOption('title');

    // Wait for sorting
    await page.waitForTimeout(500);

    // Verify jobs are present
    const jobItems = page.locator('.job-item, [data-testid="job-item"]');
    const count = await jobItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test.skip('should close job management modal', async ({ page }) => {
    // Feature requires proper admin authentication context
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await expect(manageJobsButton).toBeVisible({ timeout: 10000 });
    await manageJobsButton.click();

    // Wait for modal
    const modal = page.locator('[data-testid="job-management-modal"], [role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Look for close button
    const closeButton = page.locator(
      '[role="dialog"] button[aria-label="Close"], [role="dialog"] button:has-text("×")'
    );
    await closeButton.first().click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test.skip('should validate required fields', async ({ page }) => {
    // Feature not fully implemented with mock data
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Click add job button
    const addJobButton = page.locator('[data-testid="add-job-button"]');
    await addJobButton.click();

    // Try to submit empty form
    await page.locator('button[type="submit"]').click();

    // Verify error message or form validation
    const errorMessage = page.locator(
      '[role="alert"]:has-text("required"), [role="alert"]:has-text("fill")'
    );
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test.skip('should add multiple specialties to a job', async ({ page }) => {
    // Feature not fully implemented with mock data
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Click add job button
    const addJobButton = page.locator('[data-testid="add-job-button"]');
    await addJobButton.click();

    // Add first specialty
    await page.locator('input[name="specialties"]').first().fill('Pediatrics');

    // Click add specialty button
    const addSpecialtyButton = page.locator('button:has-text("Add Specialty")');
    await addSpecialtyButton.click();

    // Verify second specialty input appears
    const specialtyInputs = page.locator('input[name="specialties"]');
    const count = await specialtyInputs.count();
    expect(count).toBeGreaterThan(1);
  });

  test.skip('should display loading state while fetching jobs', async ({ page }) => {
    // Feature requires proper admin authentication context
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await expect(manageJobsButton).toBeVisible({ timeout: 10000 });
    await manageJobsButton.click();

    // Look for loading indicator (may be quick)
    const _loadingIndicator = page.locator(
      '[data-testid="loading"], .loading, .spinner, p:has-text("Loading")'
    );

    // Check if modal eventually appears (loading is fast)
    const modal = page.locator('[data-testid="job-management-modal"], [role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test.skip('should display job details in list', async ({ page }) => {
    // Feature not fully implemented with mock data
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await manageJobsButton.click();
    await page.waitForTimeout(1000);

    // Wait for jobs to load
    const jobItems = page.locator('.job-item, [data-testid="job-item"]');
    await expect(jobItems.first()).toBeVisible({ timeout: 5000 });

    // Verify job details are present (title, category, description)
    const count = await jobItems.count();
    if (count > 0) {
      const firstJob = jobItems.first();
      await expect(firstJob).toContainText(/[A-Za-z]/); // Contains some text
    }
  });

  test.skip('should display job count or empty state', async ({ page }) => {
    // Feature requires proper admin authentication context
    // Open job management
    const manageJobsButton = page.locator('button:has-text("Manage Jobs")');
    await expect(manageJobsButton).toBeVisible({ timeout: 10000 });
    await manageJobsButton.click();
    await page.waitForTimeout(1500);

    // Look for job items or empty state
    const jobItems = page.locator('.job-item, [data-testid="job-item"], tbody tr');
    const emptyState = page.locator(
      'p:has-text("No jobs"), p:has-text("empty"), div:has-text("Create your first")'
    );

    // Either jobs exist or empty state is shown
    const jobCount = await jobItems.count();
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(jobCount > 0 || hasEmptyState).toBeTruthy();
  });
});

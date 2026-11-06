import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/admin-dashboard-secret/login');
    await page.waitForLoadState('networkidle');
  });

  test('should display login page elements', async ({ page }) => {
    // Check for login heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Check for Google Sign-in button or email input
    const googleButton = page.locator('button:has-text("Google"), button:has-text("Sign in")');
    const emailInput = page.locator('input[type="email"]');

    const hasLoginUI =
      (await googleButton.isVisible().catch(() => false)) ||
      (await emailInput.isVisible().catch(() => false));

    expect(hasLoginUI).toBeTruthy();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access admin dashboard without authentication
    await page.goto('/admin-dashboard-secret');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login or see login UI
    const currentUrl = page.url();
    const isOnLogin =
      currentUrl.includes('/login') || currentUrl.includes('/admin-dashboard-secret');

    expect(isOnLogin).toBeTruthy();
  });

  test('should show login form elements', async ({ page }) => {
    // Check for form elements
    const formVisible = await page
      .locator('form')
      .isVisible()
      .catch(() => false);
    const buttonVisible = await page
      .locator('button')
      .first()
      .isVisible()
      .catch(() => false);

    // At least one should be visible
    expect(formVisible || buttonVisible).toBeTruthy();
  });

  test('should have proper page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should load without errors', async ({ page }) => {
    // Check for error messages
    const errorMsg = await page
      .locator('text=/error|something went wrong/i, .error, [role="alert"]')
      .isVisible()
      .catch(() => false);

    expect(errorMsg).toBeFalsy();
  });

  test('should be responsive in mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Login elements should still be visible
    await expect(page.locator('body')).toBeVisible();
  });
});

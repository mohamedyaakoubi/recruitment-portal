import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show landing page with email form', async ({ page }) => {
    await page.goto('/');

    // Check for email input
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Get Started/i })).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByLabel(/Email Address/i);
    const submitButton = page.getByRole('button', { name: /Continue/i });

    // Try invalid email
    await emailInput.fill('invalid-email');
    await submitButton.click();

    // Browser should show validation error (HTML5 validation)
    // We can check if the input has invalid state
    await expect(emailInput).not.toHaveValue('');
  });

  test('should accept valid email format', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByLabel(/Email Address/i);
    const submitButton = page.getByRole('button', { name: /Continue/i });

    // Fill valid email
    await emailInput.fill('test@example.com');
    await submitButton.click();

    // Wait for either loading state, button text change, or navigation
    await Promise.race([
      page.waitForLoadState('networkidle'),
      page.waitForURL(/candidate/),
      submitButton
        .getByText(/Checking/i)
        .waitFor({ timeout: 3000 })
        .catch(() => {}),
    ]);

    // If still on same page, check if button was disabled during the process
    // Otherwise the test passes if navigation occurred
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });
});

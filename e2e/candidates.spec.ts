import { test, expect } from '@playwright/test';

test.describe('Candidate Management Flow', () => {
  test('should show landing page with email collection', async ({ page }) => {
    await page.goto('/');

    // Verify landing page elements
    await expect(page.getByRole('heading', { name: /Your Career Journey/i })).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('should have email form with proper labels', async ({ page }) => {
    await page.goto('/');

    // Check form structure
    const emailInput = page.getByLabel(/Email Address/i);
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required');
    await expect(emailInput).toHaveAttribute('placeholder');
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');

    // Check for feature cards
    await expect(page.getByText(/Global Opportunities/i)).toBeVisible();
    await expect(page.getByText(/Verified Process/i)).toBeVisible();
    await expect(page.getByText(/Fast Track/i)).toBeVisible();
  });

  test('should display contact information', async ({ page }) => {
    await page.goto('/');

    // Check footer contact info (use first() to handle multiple matches)
    await expect(page.getByText(/wassim@internationalskills.fi/i).first()).toBeVisible();
    await expect(page.getByText(/\+358 452644966/).first()).toBeVisible();
  });
});

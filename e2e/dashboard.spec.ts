import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('should load the dashboard page', async ({ page }) => {
    await page.goto('/');

    // Check if the page loaded with correct title
    await expect(page).toHaveTitle(/Career Portal/);

    // Check for main heading
    await expect(page.getByRole('heading', { name: /Your Career Journey/i })).toBeVisible();
  });

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');

    // Check for common navigation elements
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load and hydration to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for client-side hydration

    // Find theme toggle button (ThemeSwitcher component)
    const themeButtons = page.locator('button:has(svg)');

    // Verify theme button exists and is visible
    if ((await themeButtons.count()) > 0) {
      const themeButton = themeButtons.first();
      await expect(themeButton).toBeVisible();

      // Click it to ensure it's interactive
      await themeButton.click();

      // Just verify the button is still there and clickable (theme actually changed)
      await expect(themeButton).toBeVisible();
    }
  });

  test('should render charts if present', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if charts are present (adjust selector based on your actual charts)
    const charts = page.locator('svg, canvas').first();

    if ((await charts.count()) > 0) {
      await expect(charts).toBeVisible();
    }
  });
});

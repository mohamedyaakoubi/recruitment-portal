import { test, expect } from '@playwright/test';

test.describe('Example E2E Test', () => {
  test('homepage should load', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Basic assertion - page should have content
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(0);
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Get all links
    const links = await page.locator('a[href]').all();

    if (links.length > 0) {
      // Click the first internal link
      const firstLink = links[0];
      if (!firstLink) return;

      const href = await firstLink.getAttribute('href');

      if (href && href.startsWith('/')) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');

        // Verify navigation occurred
        expect(page.url()).toContain(href);
      }
    }
  });
});

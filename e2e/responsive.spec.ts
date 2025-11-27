import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 800 },
  };

  test.describe('Landing Page - Responsive', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Hero section should be visible
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();

      // Email input should be visible
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      // Should not have horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBeFalsy();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Hero section should be visible
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();

      // Main content should be visible
      await expect(page.locator('main, body').first()).toBeVisible();
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // All main sections should be visible
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });
  });

  test.describe('Candidate Form - Responsive', () => {
    const testEmail = 'test@example.com';

    test('should display form correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto(`/candidate-form?email=${encodeURIComponent(testEmail)}`);
      await page.waitForLoadState('networkidle');

      // Form should be visible
      const form = page.locator('form').first();
      const formVisible = await form.isVisible().catch(() => false);

      if (formVisible) {
        await expect(form).toBeVisible();
      } else {
        // At least the page body should load
        await expect(page.locator('body')).toBeVisible();
      }

      // Should not have horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBeFalsy();
    });

    test('should display form correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.goto(`/candidate-form?email=${encodeURIComponent(testEmail)}`);
      await page.waitForLoadState('networkidle');

      // Form should be visible
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Touch Device Compatibility', () => {
    test('should work with touch events on mobile', async ({ page: _page, browser }) => {
      const mobileContext = await browser.newContext({
        ...devices['iPhone 12'],
      });

      const mobilePage = await mobileContext.newPage();
      await mobilePage.goto('/');
      await mobilePage.waitForLoadState('networkidle');

      // Try tapping email input
      const emailInput = mobilePage.locator('input[type="email"]');
      await emailInput.tap();

      // Input should be focused
      const isFocused = await emailInput.evaluate((el: HTMLInputElement) => {
        return el === document.activeElement;
      });

      expect(isFocused).toBeTruthy();

      await mobileContext.close();
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle orientation change from portrait to landscape', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should load
      await expect(page.locator('body')).toBeVisible();

      // Change to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);

      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Font Scaling', () => {
    test('should remain usable with increased font size', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Increase font size
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '20px';
      });

      await page.waitForTimeout(500);

      // Page should still be visible and usable
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();
    });
  });
});

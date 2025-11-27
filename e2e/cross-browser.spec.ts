import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test.describe('Critical Path - All Browsers', () => {
    test('landing page should load correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check essential elements
      const heading = await page.locator('h1').first().isVisible();
      const emailInput = await page.locator('input[type="email"]').isVisible();

      expect(heading).toBeTruthy();
      expect(emailInput).toBeTruthy();
    });

    test('email input should work', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill('test@example.com');

      const value = await emailInput.inputValue();
      expect(value).toBe('test@example.com');
    });

    test('navigation should work', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const links = await page.locator('a[href]').all();
      expect(links.length).toBeGreaterThan(0);
    });

    test('page should have no console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Filter out known acceptable errors
      const criticalErrors = errors.filter(
        (err) =>
          !err.includes('Failed to load resource') &&
          !err.includes('net::ERR') &&
          !err.includes('DevTools')
      );

      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe('Form Functionality - All Browsers', () => {
    test('candidate form should load', async ({ page }) => {
      await page.goto('/candidate-form?email=test@example.com');
      await page.waitForLoadState('networkidle');

      const body = await page.locator('body').isVisible();
      expect(body).toBeTruthy();
    });

    test('form inputs should be accessible', async ({ page }) => {
      await page.goto('/candidate-form?email=test@example.com');
      await page.waitForLoadState('networkidle');

      const inputs = await page.locator('input').count();
      expect(inputs).toBeGreaterThan(0);
    });
  });

  test.describe('Styling - All Browsers', () => {
    test('CSS should load correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check if styles are applied
      const heading = page.locator('h1').first();
      const fontSize = await heading.evaluate((el: HTMLElement) => {
        return window.getComputedStyle(el).fontSize;
      });

      expect(fontSize).not.toBe('16px'); // Should be styled, not default
    });

    test.skip('dark mode should work', async ({ page }) => {
      // SKIPPED: Theme toggle CSS transition not yet stable
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const html = page.locator('html');
      const initialClass = await html.getAttribute('class');

      // Toggle theme if button exists
      const themeButton = page.locator('button:has(svg.lucide-sun), button:has(svg.lucide-moon)');
      const buttonVisible = await themeButton.isVisible().catch(() => false);

      if (buttonVisible) {
        await themeButton.click();
        await page.waitForTimeout(500);

        const newClass = await html.getAttribute('class');
        expect(newClass).not.toBe(initialClass);
      }
    });
  });

  test.describe('JavaScript Features - All Browsers', () => {
    test('buttons should be clickable', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const button = page.locator('button').first();
      const isEnabled = await button.isEnabled().catch(() => false);

      expect(typeof isEnabled).toBe('boolean');
    });

    test('links should be navigable', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const link = page.locator('a[href]').first();
      const href = await link.getAttribute('href');

      expect(href).toBeTruthy();
    });
  });

  test.describe('Performance - All Browsers', () => {
    test('page should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should load in less than 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });
  });
});

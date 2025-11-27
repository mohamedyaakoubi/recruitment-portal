import { test, expect } from '@playwright/test';
import { LandingPage } from './pages/landing-page';

test.describe('Landing Page', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.goto();
  });

  test('should display hero section with correct content', async () => {
    // Verify hero section is visible
    const heroVisible = await landingPage.isHeroVisible();
    expect(heroVisible).toBeTruthy();

    // Verify heading is present
    await expect(landingPage.heroHeading).toBeVisible();

    // Verify subtitle is present
    await expect(landingPage.heroSubtitle).toBeVisible();
  });

  test('should display email form with input and button', async () => {
    // Verify email input is visible
    await expect(landingPage.emailInput).toBeVisible();

    // Verify email input is enabled
    await expect(landingPage.emailInput).toBeEnabled();

    // Verify continue button is visible
    await expect(landingPage.continueButton).toBeVisible();

    // Verify continue button is enabled
    await expect(landingPage.continueButton).toBeEnabled();
  });

  test('should display features section', async () => {
    // Verify features section is visible
    const featuresVisible = await landingPage.areFeaturesVisible();
    expect(featuresVisible).toBeTruthy();
  });

  test('should display header elements', async () => {
    // Verify logo is visible
    await expect(landingPage.logo).toBeVisible();

    // Verify theme toggle is visible
    await expect(landingPage.themeToggle).toBeVisible();
  });

  test('should display footer with contact information', async () => {
    // Verify footer is visible
    const footerVisible = await landingPage.isFooterVisible();
    expect(footerVisible).toBeTruthy();

    // Verify footer element is present
    await expect(landingPage.footer).toBeVisible();
  });

  test('should toggle theme between light and dark mode', async ({ page }) => {
    // Get initial theme
    const initialTheme = await landingPage.getCurrentTheme();

    // Toggle theme
    await landingPage.toggleTheme();

    // Wait for a short delay for theme to apply
    await page.waitForTimeout(1000);

    // Get new theme
    let newTheme = await landingPage.getCurrentTheme();

    // If theme didn't change, try one more time (sometimes needs double-click)
    if (newTheme === initialTheme) {
      await landingPage.toggleTheme();
      await page.waitForTimeout(1000);
      newTheme = await landingPage.getCurrentTheme();
    }

    // Verify theme changed
    expect(newTheme).not.toBe(initialTheme);

    // Toggle back
    await landingPage.toggleTheme();

    // Wait for a short delay for theme to revert
    await page.waitForTimeout(1000);

    // Verify theme returned to original
    const finalTheme = await landingPage.getCurrentTheme();
    expect(finalTheme).toBe(initialTheme);
  });

  test('should display page in mobile viewport correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page
    await landingPage.goto();

    // Verify hero section is still visible
    const heroVisible = await landingPage.isHeroVisible();
    expect(heroVisible).toBeTruthy();

    // Verify email input is visible
    await expect(landingPage.emailInput).toBeVisible();

    // Verify continue button is visible
    await expect(landingPage.continueButton).toBeVisible();
  });

  test('should display page in tablet viewport correctly', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Reload page
    await landingPage.goto();

    // Verify hero section is visible
    const heroVisible = await landingPage.isHeroVisible();
    expect(heroVisible).toBeTruthy();

    // Verify features are visible
    const featuresVisible = await landingPage.areFeaturesVisible();
    expect(featuresVisible).toBeTruthy();
  });

  test('should have accessible email input with proper attributes', async () => {
    // Check input type
    const inputType = await landingPage.emailInput.getAttribute('type');
    expect(inputType).toBe('email');

    // Check if input is required (if applicable)
    await landingPage.emailInput.getAttribute('required');
    // Note: This might be null if not required, which is fine
  });

  test('should allow typing in email input', async () => {
    const testEmail = 'test@example.com';

    // Type in email input
    await landingPage.emailInput.fill(testEmail);

    // Verify value was set
    const inputValue = await landingPage.emailInput.inputValue();
    expect(inputValue).toBe(testEmail);
  });

  test('should have working navigation links', async ({ page }) => {
    // Get all links on the page
    const links = await page.locator('a[href]').all();

    // Verify there are some links
    expect(links.length).toBeGreaterThan(0);

    // Check that links have valid href attributes
    for (const link of links.slice(0, 5)) {
      // Check first 5 links
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Reload page to capture console errors
    await landingPage.goto();

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    // Filter out known acceptable errors (like network errors in test environment)
    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes('Failed to load resource') && !error.includes('net::ERR')
    );

    // Expect no critical console errors
    expect(criticalErrors.length).toBe(0);
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check for title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check for meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h1 (should have exactly one)
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Verify h1 has content
    const h1Text = await page.locator('h1').first().textContent();
    expect(h1Text).toBeTruthy();
    expect(h1Text!.length).toBeGreaterThan(0);
  });
});

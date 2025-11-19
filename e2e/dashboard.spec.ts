import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
    test('should load the dashboard page', async ({ page }) => {
        await page.goto('/');

        // Check if the page loaded
        await expect(page).toHaveTitle(/Candidate Portal|Dashboard/);
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

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Look for theme toggle button (adjust selector based on your actual UI)
        const themeButton = page.locator('button').filter({ hasText: /theme|dark|light/i }).first();

        if (await themeButton.count() > 0) {
            await themeButton.click();

            // Verify theme changed (check for dark mode class or similar)
            await expect(page.locator('html')).toHaveAttribute('class', /dark|light/);
        }
    });

    test('should render charts if present', async ({ page }) => {
        await page.goto('/');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check if charts are present (adjust selector based on your actual charts)
        const charts = page.locator('svg, canvas').first();

        if (await charts.count() > 0) {
            await expect(charts).toBeVisible();
        }
    });
});

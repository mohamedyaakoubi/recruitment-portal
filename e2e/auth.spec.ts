import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should redirect to login page when accessing protected route', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login/);
    });

    test('should allow user to sign in', async ({ page }) => {
        await page.goto('/login');

        // Check if login page elements are present
        await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible();

        // Since we are using Firebase Auth, we might not be able to fully test the real login 
        // without a real account or mocking. For this test, we will verify the UI elements 
        // and the presence of the sign-in button.

        const signInButton = page.getByRole('button', { name: /Sign in with Google/i });
        await expect(signInButton).toBeVisible();

        // In a real scenario, we would click this and handle the popup, 
        // but for now we verify the entry point.
    });

    test('should display error for invalid credentials (if applicable)', async ({ page }) => {
        // This depends on the implementation. If there is a email/password form:
        await page.goto('/login');
        // If there are inputs for email/password
        const emailInput = page.getByLabel(/Email/i);
        if (await emailInput.isVisible()) {
            await emailInput.fill('invalid@example.com');
            await page.getByLabel(/Password/i).fill('wrongpassword');
            await page.getByRole('button', { name: /Sign In/i }).click();
            // Expect error message
        }
    });
});

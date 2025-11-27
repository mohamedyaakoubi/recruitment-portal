import { Page, expect } from '@playwright/test';

/**
 * Generate a unique test email address
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Generate mock candidate data for testing
 */
export function generateTestCandidate() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return {
    email: `test-${timestamp}-${random}@example.com`,
    firstName: 'Test',
    lastName: 'Candidate',
    dateOfBirth: '1990-01-01',
    nationality: 'Tunisia',
    gender: 'Male',
    phone: '+21612345678',
    currentLocation: 'Tunisia',
    jobCategory: 'Healthcare',
    jobPosition: 'Nurse',
    source: 'Facebook',
    specialty: 'Pediatrics',
    comment: 'This is a test candidate',
  };
}

/**
 * Wait for a toast notification to appear
 * @param page - Playwright page object
 * @param type - Type of toast (success, error, info)
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForToast(
  page: Page,
  type: 'success' | 'error' | 'info' = 'success',
  timeout = 5000
): Promise<void> {
  // Common toast selectors - adjust based on your toast implementation
  const toastSelectors = ['[role="alert"]', '.toast', '[data-testid="toast"]', '.notification'];

  for (const selector of toastSelectors) {
    try {
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      return;
    } catch {
      // Try next selector
    }
  }

  // If no toast found, log a warning but don't fail
  console.warn(`No toast notification found for type: ${type}`);
}

/**
 * Clear local storage and session storage
 * @param page - Playwright page object
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Clear all cookies
 * @param page - Playwright page object
 */
export async function clearCookies(page: Page): Promise<void> {
  const context = page.context();
  await context.clearCookies();
}

/**
 * Wait for network to be idle
 * @param page - Playwright page object
 */
export async function waitForNetworkIdle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Fill form field and verify it was filled
 * @param page - Playwright page object
 * @param selector - CSS selector for the input
 * @param value - Value to fill
 */
export async function fillAndVerify(page: Page, selector: string, value: string): Promise<void> {
  await page.fill(selector, value);
  const inputValue = await page.inputValue(selector);
  expect(inputValue).toBe(value);
}

/**
 * Upload a file to an input element
 * @param page - Playwright page object
 * @param selector - CSS selector for the file input
 * @param filePath - Path to the file to upload
 */
export async function uploadFile(page: Page, selector: string, filePath: string): Promise<void> {
  const fileInput = page.locator(selector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Wait for an element to be visible
 * @param page - Playwright page object
 * @param selector - CSS selector
 * @param timeout - Maximum time to wait
 */
export async function waitForVisible(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Wait for an element to be hidden
 * @param page - Playwright page object
 * @param selector - CSS selector
 * @param timeout - Maximum time to wait
 */
export async function waitForHidden(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { state: 'hidden', timeout });
}

/**
 * Take a screenshot with a descriptive name
 * @param page - Playwright page object
 * @param name - Screenshot name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
}

/**
 * Scroll to an element
 * @param page - Playwright page object
 * @param selector - CSS selector
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Get text content of an element
 * @param page - Playwright page object
 * @param selector - CSS selector
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = page.locator(selector);
  return (await element.textContent()) || '';
}

/**
 * Check if element exists
 * @param page - Playwright page object
 * @param selector - CSS selector
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const count = await page.locator(selector).count();
  return count > 0;
}

/**
 * Wait for API response
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to match
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.waitForResponse(urlPattern);
}

/**
 * Mock API response
 * @param page - Playwright page object
 * @param url - URL to mock
 * @param response - Response data
 */
export async function mockApiResponse(
  page: Page,
  url: string | RegExp,
  response: object
): Promise<void> {
  await page.route(url, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

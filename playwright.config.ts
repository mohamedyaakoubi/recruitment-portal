import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',

  /* Global setup file */
  globalSetup: path.resolve(__dirname, 'e2e', 'global-setup.ts'),

  /* Maximum time one test can run for */
  timeout: 30 * 1000, // 30 seconds per test

  /* Maximum time for the entire test run */
  globalTimeout: 20 * 60 * 1000, // 20 minutes for 500+ tests

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Optimize workers for i5 11th gen with 16GB RAM - 3 workers to reduce memory pressure with 500+ tests */
  workers: process.env.CI ? 1 : 3,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Disable trace to save CPU/memory */
    trace: 'off',

    /* Disable screenshots to save CPU/disk I/O */
    screenshot: 'off',

    /* Disable video recording to save significant CPU/memory/disk */
    video: 'off',

    /* Reduce navigation timeout for faster test execution */
    navigationTimeout: 20 * 1000,

    /* Reduce action timeout for faster test execution */
    actionTimeout: 8 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

import { chromium, FullConfig } from '@playwright/test';
import { setupAuthState } from './utils/auth-helpers';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig): Promise<void> {
  // Load test environment variables
  dotenv.config({ path: path.resolve(__dirname, '.env.test') });

  console.warn('🚀 Starting global setup...');

  // Get base URL from config - use the first project's baseURL
  const project = config.projects[0];
  const baseURL = project?.use?.baseURL || 'http://localhost:3000';

  // Create a browser instance
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to base URL first (required to access localStorage)
    console.warn(`🌐 Navigating to ${baseURL}...`);
    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');

    // Set up admin authentication
    console.warn('🔐 Setting up admin authentication...');

    await setupAuthState(page, {
      uid: 'test-admin-uid',
      email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
      displayName: 'Test Admin',
      emailVerified: true,
    });

    // Save authentication state
    const authDir = path.resolve(__dirname, '.auth');
    const authFile = path.join(authDir, 'admin-storage-state.json');

    // Create .auth directory if it doesn't exist
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    await page.context().storageState({ path: authFile });

    console.warn('✅ Admin authentication state saved');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    console.warn('\n💡 Make sure your dev server is running on http://localhost:3000');
    console.warn('   Run: npm run dev');
    throw error;
  } finally {
    await browser.close();
  }

  console.warn('✅ Global setup completed');
}

export default globalSetup;

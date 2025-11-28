import { Page } from '@playwright/test';

/**
 * Firebase authentication state interface
 */
export interface AuthState {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

/**
 * Login as admin user using Firebase authentication
 * Note: This is a simplified version. In production, you would use Firebase's actual auth flow
 * @param page - Playwright page object
 * @param email - Admin email
 * @param password - Admin password
 */
export async function loginAsAdmin(page: Page, email?: string, _password?: string): Promise<void> {
  const adminEmail = email || process.env.TEST_ADMIN_EMAIL || 'admin@example.com';

  // Navigate to any page first to establish domain context for localStorage
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Set up authentication state after we have domain context
  await setupAuthState(page, {
    uid: 'test-admin-uid',
    email: adminEmail,
    displayName: 'Test Admin',
    emailVerified: true,
  });

  // Navigate to admin dashboard
  await page.goto('/admin-dashboard-secret', { timeout: 30000 });

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');

  // Check if already authenticated
  const currentUrl = page.url();
  if (currentUrl.includes('/admin-dashboard-secret') && !currentUrl.includes('/login')) {
    // Already logged in
    return;
  }

  // If still on login page, reload to apply auth state
  if (currentUrl.includes('/login')) {
    try {
      await page.reload({ timeout: 30000 });
      await page.waitForLoadState('domcontentloaded');
    } catch {
      // Reload timeout, page might already be loading
      await page.waitForTimeout(2000);
    }
  }
}

/**
 * Set up authentication state by injecting Firebase auth tokens
 * @param page - Playwright page object
 * @param authState - Authentication state to set
 */
export async function setupAuthState(page: Page, authState: AuthState): Promise<void> {
  // Get Firebase API key from environment (server-side)
  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'test-api-key';

  try {
    // Mock Firebase auth state in localStorage
    await page.evaluate(
      ({ state, apiKey }) => {
        // Firebase stores auth state in localStorage with a specific key pattern
        const firebaseKey = `firebase:authUser:${apiKey}:[DEFAULT]`;

        const authData = {
          uid: state.uid,
          email: state.email,
          emailVerified: state.emailVerified,
          displayName: state.displayName,
          photoURL: state.photoURL,
          stsTokenManager: {
            refreshToken: 'mock-refresh-token',
            accessToken: 'mock-access-token',
            expirationTime: Date.now() + 3600000, // 1 hour from now
          },
          createdAt: Date.now().toString(),
          lastLoginAt: Date.now().toString(),
        };

        localStorage.setItem(firebaseKey, JSON.stringify(authData));
      },
      { state: authState, apiKey: firebaseApiKey }
    );
  } catch (error) {
    // If localStorage is not accessible, log warning but don't fail
    console.warn('Failed to set auth state in localStorage:', error);
  }
}

/**
 * Mock Firebase authentication for testing
 * This intercepts Firebase auth API calls and returns mock responses
 * @param page - Playwright page object
 */
export async function mockFirebaseAuth(page: Page): Promise<void> {
  // Intercept Firebase auth API calls
  await page.route('**/identitytoolkit.googleapis.com/**', (route) => {
    const url = route.request().url();

    if (url.includes('signInWithPassword')) {
      // Mock successful sign-in
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#VerifyPasswordResponse',
          localId: 'test-admin-uid',
          email: 'admin@example.com',
          displayName: 'Test Admin',
          idToken: 'mock-id-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: '3600',
        }),
      });
    } else if (url.includes('getAccountInfo')) {
      // Mock account info
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [
            {
              localId: 'test-admin-uid',
              email: 'admin@example.com',
              emailVerified: true,
              displayName: 'Test Admin',
            },
          ],
        }),
      });
    } else {
      // Allow other requests to pass through
      route.continue();
    }
  });
}

/**
 * Logout the current user
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  try {
    // Clear all auth-related data
    await page.evaluate(() => {
      // Clear all localStorage items that match Firebase auth pattern
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('firebase:authUser:')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear session storage
      sessionStorage.clear();
    });

    // Clear cookies
    const context = page.context();
    await context.clearCookies();
  } catch (error) {
    console.warn('Failed to logout:', error);
  }
}

/**
 * Check if user is authenticated
 * @param page - Playwright page object
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    return await page.evaluate(() => {
      // Check if Firebase auth state exists in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('firebase:authUser:')) {
          const authData = localStorage.getItem(key);
          if (authData) {
            try {
              const parsed = JSON.parse(authData);
              return !!parsed.uid;
            } catch {
              return false;
            }
          }
        }
      }
      return false;
    });
  } catch (error) {
    console.warn('Failed to check authentication:', error);
    return false;
  }
}

/**
 * Get current user from auth state
 * @param page - Playwright page object
 */
export async function getCurrentUser(page: Page): Promise<AuthState | null> {
  try {
    return await page.evaluate(() => {
      // Get Firebase auth state from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('firebase:authUser:')) {
          const authData = localStorage.getItem(key);
          if (authData) {
            try {
              const parsed = JSON.parse(authData);
              return {
                uid: parsed.uid,
                email: parsed.email,
                displayName: parsed.displayName,
                photoURL: parsed.photoURL,
                emailVerified: parsed.emailVerified,
              };
            } catch {
              return null;
            }
          }
        }
      }
      return null;
    });
  } catch (error) {
    console.warn('Failed to get current user:', error);
    return null;
  }
}

/**
 * Wait for authentication to complete
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForAuth(page: Page, timeout = 5000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const authenticated = await isAuthenticated(page);
    if (authenticated) {
      return;
    }
    await page.waitForTimeout(100);
  }

  throw new Error('Authentication timeout');
}

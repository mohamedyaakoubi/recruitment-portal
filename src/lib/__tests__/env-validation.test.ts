/**
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateEnvironment, validateAndLogEnvironment } from '@/lib/env-validation';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should pass with all required variables set', () => {
      process.env = {
        ...process.env,
        FIREBASE_PROJECT_ID: 'test-project',
        FIREBASE_CLIENT_EMAIL: 'test@test.com',
        FIREBASE_PRIVATE_KEY: 'test-key',
        NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456',
        NEXT_PUBLIC_FIREBASE_APP_ID: 'test-app-id',
        ADMIN_EMAILS: 'admin@test.com',
      };

      const result = validateEnvironment();

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should fail with missing required variables', () => {
      process.env = {
        FIREBASE_PROJECT_ID: 'test-project',
        // Missing other required variables
      };

      const result = validateEnvironment();

      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
      expect(result.missing[0]).toContain('FIREBASE_CLIENT_EMAIL');
    });

    it('should include warnings for missing optional variables', () => {
      process.env = {
        ...process.env,
        FIREBASE_PROJECT_ID: 'test-project',
        FIREBASE_CLIENT_EMAIL: 'test@test.com',
        FIREBASE_PRIVATE_KEY: 'test-key',
        NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456',
        NEXT_PUBLIC_FIREBASE_APP_ID: 'test-app-id',
        ADMIN_EMAILS: 'admin@test.com',
        // Optional variables not set
      };

      const result = validateEnvironment();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should treat empty strings as missing', () => {
      process.env = {
        ...process.env,
        FIREBASE_PROJECT_ID: '',
        FIREBASE_CLIENT_EMAIL: 'test@test.com',
        FIREBASE_PRIVATE_KEY: 'test-key',
        NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456',
        NEXT_PUBLIC_FIREBASE_APP_ID: 'test-app-id',
        ADMIN_EMAILS: 'admin@test.com',
      };

      const result = validateEnvironment();

      expect(result.valid).toBe(false);
      expect(result.missing.some((m) => m.includes('FIREBASE_PROJECT_ID'))).toBe(true);
    });
  });

  describe('validateAndLogEnvironment', () => {
    it('should throw error when required variables are missing', () => {
      process.env = {
        FIREBASE_PROJECT_ID: 'test-project',
        // Missing other required variables
      };

      expect(() => validateAndLogEnvironment()).toThrow('Missing required environment variables');
    });

    it('should not throw when all required variables are set', () => {
      process.env = {
        ...process.env,
        FIREBASE_PROJECT_ID: 'test-project',
        FIREBASE_CLIENT_EMAIL: 'test@test.com',
        FIREBASE_PRIVATE_KEY: 'test-key',
        NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456',
        NEXT_PUBLIC_FIREBASE_APP_ID: 'test-app-id',
        ADMIN_EMAILS: 'admin@test.com',
      };

      expect(() => validateAndLogEnvironment()).not.toThrow();
    });
  });
});

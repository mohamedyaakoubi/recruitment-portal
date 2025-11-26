import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

// Set env vars BEFORE importing
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/callback';

// Mock googleapis
vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        generateAuthUrl: vi.fn(),
        setCredentials: vi.fn(),
        on: vi.fn(),
      })),
    },
  },
}));

// Mock firebase-admin
vi.mock('../firebase-admin', () => ({
  getFirestoreAdmin: vi.fn(() => ({
    doc: vi.fn(() => ({
      set: vi.fn(),
      get: vi.fn(),
    })),
  })),
}));

import { getOAuth2Client, storeTokens, getAuthenticatedClient } from '../googleOAuth';
import { getFirestoreAdmin } from '../firebase-admin';

describe('googleOAuth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/callback';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getOAuth2Client', () => {
    it('should throw error when CLIENT_ID is missing', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      expect(() => getOAuth2Client()).toThrow(
        'Google OAuth2 credentials are not configured in environment variables.'
      );
    });
  });

  describe('storeTokens', () => {
    it('should store tokens in Firestore', async () => {
      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockDoc = vi.fn().mockReturnValue({ set: mockSet });
      (getFirestoreAdmin as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ doc: mockDoc });

      const tokens = { access_token: 'test-token' };
      await storeTokens(tokens);

      expect(mockDoc).toHaveBeenCalledWith('settings/google_auth_tokens');
      expect(mockSet).toHaveBeenCalledWith(tokens);
    });
  });

  describe('getAuthenticatedClient', () => {
    it('should return null when no tokens are stored', async () => {
      const mockGet = vi.fn().mockResolvedValue({ exists: false });
      const mockDoc = vi.fn().mockReturnValue({ get: mockGet });
      (getFirestoreAdmin as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ doc: mockDoc });

      const client = await getAuthenticatedClient();
      expect(client).toBeNull();
    });
  });
});

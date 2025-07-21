/**
 * @jest-environment node
 */

import { getGoogleAuth } from '../google';
import { google } from 'googleapis';

jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn(),
    },
  },
}));

describe('Google Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_PRIVATE_KEY = 'test-private-key';
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.com';
  });

  it('should create a GoogleAuth instance with correct credentials and scopes', () => {
    getGoogleAuth();

    expect(google.auth.GoogleAuth).toHaveBeenCalled();
    const authOptions = (google.auth.GoogleAuth as jest.Mock).mock.calls[0][0];
    
    expect(authOptions.credentials.private_key).toBe('test-private-key');
    expect(authOptions.credentials.client_email).toBe('test@example.com');
    expect(authOptions.scopes).toEqual([
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ]);
  });
});

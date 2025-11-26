import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as emailVerification from '@/services/emailVerification';

// Mock the email verification service
vi.mock('@/services/emailVerification');

describe('POST /api/verify-email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when email is missing', async () => {
    const request = {
      json: async () => ({}),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email is required');
  });

  it('should verify email successfully', async () => {
    const mockResult = {
      isValid: true,
      email: 'test@example.com',
      deliverable: true,
      disposable: false,
    };

    vi.mocked(emailVerification.verifyEmail).mockResolvedValue(mockResult);

    const request = {
      json: async () => ({ email: 'test@example.com' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.isValid).toBe(true);
    expect(data.email).toBe('test@example.com');
    expect(emailVerification.verifyEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should return verification result from service', async () => {
    const mockResult = {
      isValid: false,
      email: 'invalid@test.com',
      deliverable: false,
      reason: 'Invalid domain',
    };

    vi.mocked(emailVerification.verifyEmail).mockResolvedValue(mockResult);

    const request = {
      json: async () => ({ email: 'invalid@test.com' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.isValid).toBe(false);
    expect(data.reason).toBe('Invalid domain');
  });

  it('should handle service errors', async () => {
    vi.mocked(emailVerification.verifyEmail).mockRejectedValue(new Error('Service error'));

    const request = {
      json: async () => ({ email: 'test@example.com' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error during email verification');
  });
});

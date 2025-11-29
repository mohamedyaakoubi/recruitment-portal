import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as emailService from '@/services/email';

vi.mock('@/services/email');

// Mock security logger
vi.mock('@/lib/security-logger', () => ({
  extractSecurityContext: vi.fn(() => ({
    ip: 'test-ip',
    userAgent: 'test-agent',
    path: '/api/test',
    method: 'POST',
  })),
  logSecurityEvent: vi.fn(),
  SecurityEventType: {
    EMAIL_SEND_FAILED: 'email_send_failed',
    INPUT_VALIDATION_FAILED: 'input_validation_failed',
  },
}));

// Mock auth module
vi.mock('@/lib/auth', () => ({
  requireAdminAuth: vi.fn(async () => null),
  isAdminAuthenticated: vi.fn(async () => true),
  getUserFromRequest: vi.fn(() => ({ id: 'test-admin', ip: 'test-ip' })),
}));

describe('POST /api/send-confirmation-email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when required fields missing', async () => {
    const request = {
      json: async () => ({ candidateEmail: 'test@example.com' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should send confirmation email successfully', async () => {
    vi.mocked(emailService.sendApplicationConfirmationEmail).mockResolvedValue(undefined);

    const request = {
      json: async () => ({
        candidateEmail: 'test@example.com',
        candidateName: 'John Doe',
        jobTitle: 'Developer',
        applicationId: 'app123',
      }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(emailService.sendApplicationConfirmationEmail).toHaveBeenCalled();
  });

  it('should handle email errors', async () => {
    vi.mocked(emailService.sendApplicationConfirmationEmail).mockRejectedValue(new Error('Error'));

    const request = {
      json: async () => ({
        candidateEmail: 'test@example.com',
        candidateName: 'John Doe',
        jobTitle: 'Developer',
        applicationId: 'app123',
      }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});

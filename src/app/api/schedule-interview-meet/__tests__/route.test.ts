import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as interviewService from '@/services/interview';

vi.mock('@/services/interview');
vi.mock('@/lib/security-logger', () => ({
  extractSecurityContext: vi.fn(() => ({
    ip: 'test-ip',
    userAgent: 'test-agent',
    path: '/api/test',
    method: 'POST',
  })),
  logSecurityEvent: vi.fn(),
  SecurityEventType: {
    INTERVIEW_SCHEDULING_FAILED: 'interview_scheduling_failed',
    INPUT_VALIDATION_FAILED: 'input_validation_failed',
  },
}));

// Mock auth module
vi.mock('@/lib/auth', () => ({
  requireAdminAuth: vi.fn(async () => null),
  isAdminAuthenticated: vi.fn(async () => true),
  getUserFromRequest: vi.fn(() => ({ id: 'test-admin', ip: 'test-ip' })),
}));

describe('POST /api/schedule-interview-meet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should schedule interview successfully', async () => {
    const mockResult = {
      meetLink: 'https://meet.google.com/abc-defg-hij',
      calendarEventId: 'event123',
      interviewTimestampISO: '2024-02-01T10:00:00Z',
    };

    vi.mocked(interviewService.scheduleInterview).mockResolvedValue(mockResult);

    const request = {
      json: async () => ({
        candidateId: '123',
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        interviewDate: '2024-02-01',
        interviewTime: '10:00',
        duration: 60,
        jobTitle: 'Developer',
        adminEmail: 'admin@example.com',
      }),
      nextUrl: { origin: 'http://localhost:3000' },
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('scheduled successfully');
    expect(interviewService.scheduleInterview).toHaveBeenCalled();
  });

  it('should handle Google Calendar API errors', async () => {
    vi.mocked(interviewService.scheduleInterview).mockRejectedValue(
      new Error('Calendar API error')
    );

    const request = {
      json: async () => ({
        candidateId: '123',
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        interviewDate: '2024-02-01',
        interviewTime: '10:00',
        adminEmail: 'admin@example.com',
      }),
      nextUrl: { origin: 'http://localhost:3000' },
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to schedule interview');
  });
});

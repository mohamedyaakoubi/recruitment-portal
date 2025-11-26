import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as interviewService from '@/services/interview';

vi.mock('@/services/interview');

describe('POST /api/schedule-interview-meet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should schedule interview successfully', async () => {
    const mockResult = {
      success: true,
      meetLink: 'https://meet.google.com/abc-defg-hij',
      calendarEventId: 'event123',
      interviewDate: '2024-02-01T10:00:00Z',
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
      }),
      nextUrl: { origin: 'http://localhost:3000' },
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to schedule interview');
  });
});

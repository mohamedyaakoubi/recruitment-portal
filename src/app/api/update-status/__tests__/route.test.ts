import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as candidateService from '@/services/candidate';

// Mock candidate service
vi.mock('@/services/candidate');

describe('POST /api/update-status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when candidateId is missing', async () => {
    const request = {
      json: async () => ({ newStatus: 'approved' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 400 when newStatus is missing', async () => {
    const request = {
      json: async () => ({ candidateId: '123' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should update status successfully', async () => {
    vi.mocked(candidateService.updateCandidateStatus).mockResolvedValue({
      status: 'approved',
      emailSent: true,
    });

    const request = {
      json: async () => ({
        candidateId: '123',
        newStatus: 'approved',
      }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.newStatus).toBe('approved');
    expect(data.emailSent).toBe(true);
    expect(candidateService.updateCandidateStatus).toHaveBeenCalledWith(
      '123',
      'approved',
      undefined,
      undefined,
      undefined,
      undefined
    );
  });

  it('should handle interview scheduling data', async () => {
    vi.mocked(candidateService.updateCandidateStatus).mockResolvedValue({
      status: 'interview_scheduled',
      emailSent: true,
    });

    const request = {
      json: async () => ({
        candidateId: '123',
        newStatus: 'interview_scheduled',
        interviewTimestampISO: '2024-02-01T10:00:00Z',
        calendarEventId: 'event123',
        meetLink: 'https://meet.google.com/abc',
        duration: 60,
      }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(candidateService.updateCandidateStatus).toHaveBeenCalledWith(
      '123',
      'interview_scheduled',
      '2024-02-01T10:00:00Z',
      'event123',
      'https://meet.google.com/abc',
      60
    );
  });

  it('should handle service errors', async () => {
    vi.mocked(candidateService.updateCandidateStatus).mockRejectedValue(new Error('Service error'));

    const request = {
      json: async () => ({
        candidateId: '123',
        newStatus: 'approved',
      }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to update candidate status');
  });
});

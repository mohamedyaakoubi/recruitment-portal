import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as candidateService from '@/services/candidate';

vi.mock('@/services/candidate');
vi.mock('@/lib/csvUtils', () => ({
  generateCSV: vi.fn((candidates) => `CSV data for ${candidates.length} candidates`),
}));
vi.mock('@/lib/auth', () => ({
  requireAdminAuth: vi.fn(() => null),
}));
vi.mock('@/lib/csrf-middleware', () => ({
  withCsrfProtection: (handler: unknown) => handler,
}));
vi.mock('@/lib/security-logger', () => ({
  extractSecurityContext: vi.fn(() => ({
    ip: 'test-ip',
    userAgent: 'test-agent',
    path: '/api/test',
    method: 'POST',
  })),
  logSecurityEvent: vi.fn(),
  SecurityEventType: {
    ADMIN_DATA_EXPORTED: 'admin_data_exported',
    INPUT_VALIDATION_FAILED: 'input_validation_failed',
  },
}));

describe('POST /api/export-candidates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export candidates as CSV when format=csv', async () => {
    const mockCandidates = [
      {
        id: '1',
        fullName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        gender: 'male',
        phoneNumber: '1234567890',
        countryCode: '+1',
        dateOfBirth: '1990-01-01',
        age: 33,
        city: 'Test City',
        country: 'Test Country',
        nationality: 'Test',
        doubleNationality: '',
        jobTitle: 'test-job',
        jobTitleText: 'Test Job',
        jobCategory: 'Technology',
        specialty: 'Test Specialty',
        websites: [],
        status: 'submitted',
        score: null,
        scoreAnalysis: '',
        submittedAt: '2024-01-01 00:00:00',
        interviewDate: '',
        meetLink: '',
        calendarEventId: '',
        meetSpaceId: '',
        duration: '',
        cvUrl: '',
        passportUrl: '',
        photoUrl: '',
        applicationSource: 'web_form',
        lastUpdated: '',
        lastScoredAt: '',
      },
    ];

    vi.mocked(candidateService.exportCandidates).mockResolvedValue(mockCandidates);

    const request = {
      url: 'http://localhost:3000/api/export-candidates',
      json: async () => ({ format: 'csv' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const text = await response.text();

    expect(response.headers.get('Content-Type')).toContain('text/csv');
    expect(text).toContain('CSV data');
  });

  it('should export candidates as JSON by default', async () => {
    const mockCandidates = [
      {
        id: '1',
        fullName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        gender: 'male',
        phoneNumber: '1234567890',
        countryCode: '+1',
        dateOfBirth: '1990-01-01',
        age: 33,
        city: 'Test City',
        country: 'Test Country',
        nationality: 'Test',
        doubleNationality: '',
        jobTitle: 'test-job',
        jobTitleText: 'Test Job',
        jobCategory: 'Technology',
        specialty: 'Test Specialty',
        websites: [],
        status: 'submitted',
        score: null,
        scoreAnalysis: '',
        submittedAt: '2024-01-01 00:00:00',
        interviewDate: '',
        meetLink: '',
        calendarEventId: '',
        meetSpaceId: '',
        duration: '',
        cvUrl: '',
        passportUrl: '',
        photoUrl: '',
        applicationSource: 'web_form',
        lastUpdated: '',
        lastScoredAt: '',
      },
    ];

    vi.mocked(candidateService.exportCandidates).mockResolvedValue(mockCandidates);

    const request = {
      url: 'http://localhost:3000/api/export-candidates',
      json: async () => ({}),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.candidates).toBeDefined();
    expect(data.metadata).toBeDefined();
    expect(data.candidates.length).toBe(1);
  });

  it('should filter candidates by status', async () => {
    const mockCandidates = [
      {
        id: '1',
        fullName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        gender: 'male',
        phoneNumber: '1234567890',
        countryCode: '+1',
        dateOfBirth: '1990-01-01',
        age: 33,
        city: 'Test City',
        country: 'Test Country',
        nationality: 'Test',
        doubleNationality: '',
        jobTitle: 'test-job',
        jobTitleText: 'Test Job',
        jobCategory: 'Technology',
        specialty: 'Test Specialty',
        websites: [],
        status: 'approved',
        score: null,
        scoreAnalysis: '',
        submittedAt: '2024-01-01 00:00:00',
        interviewDate: '',
        meetLink: '',
        calendarEventId: '',
        meetSpaceId: '',
        duration: '',
        cvUrl: '',
        passportUrl: '',
        photoUrl: '',
        applicationSource: 'web_form',
        lastUpdated: '',
        lastScoredAt: '',
      },
    ];

    vi.mocked(candidateService.exportCandidates).mockResolvedValue(mockCandidates);

    const request = {
      url: 'http://localhost:3000/api/export-candidates',
      json: async () => ({ status: 'approved' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    await response.json();

    expect(candidateService.exportCandidates).toHaveBeenCalledWith(
      'approved',
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String)
    );
  });

  it('should handle empty candidate list', async () => {
    vi.mocked(candidateService.exportCandidates).mockResolvedValue([]);

    const request = {
      url: 'http://localhost:3000/api/export-candidates',
      json: async () => ({}),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.candidates).toEqual([]);
    expect(data.metadata.totalCount).toBe(0);
  });

  it('should handle database errors', async () => {
    vi.mocked(candidateService.exportCandidates).mockRejectedValue(new Error('Database error'));

    const request = {
      url: 'http://localhost:3000/api/export-candidates',
      json: async () => ({}),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to export candidates');
  });
});

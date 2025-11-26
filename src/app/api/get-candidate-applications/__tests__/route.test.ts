import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

const mockGet = vi.fn();
const mockOrderBy = vi.fn().mockReturnThis();
const mockWhere = vi.fn().mockReturnThis();
const mockCollection = vi.fn(() => ({
  where: mockWhere,
  orderBy: mockOrderBy,
  get: mockGet,
}));

vi.mock('@/lib/firebase-admin', () => ({
  getFirestoreAdmin: vi.fn(() => ({
    collection: mockCollection,
  })),
}));

describe('POST /api/get-candidate-applications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWhere.mockReturnThis();
    mockOrderBy.mockReturnThis();
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

  it('should return empty array when no applications found', async () => {
    mockGet.mockResolvedValue({ empty: true });

    const request = {
      json: async () => ({ email: 'new@example.com' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.applications).toEqual([]);
    expect(data.count).toBe(0);
  });

  it('should return applications for existing candidate', async () => {
    const mockDoc = {
      id: '123',
      data: () => ({
        fullName: 'John Doe',
        email: 'test@example.com',
        jobTitle: 'frontend-dev',
        jobTitleText: 'Frontend Developer',
        jobCategory: 'Engineering',
        specialty: 'React',
        status: 'submitted',
        score: 85,
        cvUrl: 'https://example.com/cv.pdf',
        passportUrl: 'https://example.com/passport.pdf',
        photoUrl: 'https://example.com/photo.jpg',
        meetLink: '',
        submittedAt: { toDate: () => new Date('2024-01-01') },
        interviewDate: null,
      }),
    };

    mockGet.mockResolvedValue({
      empty: false,
      forEach: (callback: (doc: unknown) => void) => callback(mockDoc),
    });

    const request = {
      json: async () => ({ email: 'test@example.com' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.applications.length).toBe(1);
    expect(data.applications[0].id).toBe('123');
    expect(data.applications[0].fullName).toBe('John Doe');
    expect(data.count).toBe(1);
  });

  it('should handle database errors', async () => {
    mockGet.mockRejectedValue(new Error('Database error'));

    const request = {
      json: async () => ({ email: 'test@example.com' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error while fetching applications');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

const mockGet = vi.fn();
const mockWhere = vi.fn().mockReturnThis();
const mockCollection = vi.fn(() => ({
  where: mockWhere,
  get: mockGet,
}));

vi.mock('@/lib/firebase-admin', () => ({
  getFirestoreAdmin: vi.fn(() => ({
    collection: mockCollection,
  })),
}));

describe('POST /api/check-candidate', () => {
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

  it('should return exists=false when candidate not found', async () => {
    mockGet.mockResolvedValue({ empty: true });

    const request = {
      json: async () => ({ email: 'new@example.com' }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(data.exists).toBe(false);
    expect(data.applications).toEqual([]);
    expect(data.count).toBe(0);
  });

  it('should return exists=true with applications when candidate found', async () => {
    const mockDoc = {
      id: '123',
      data: () => ({
        email: 'test@example.com',
        fullName: 'John Doe',
        status: 'submitted',
        submittedAt: { toDate: () => new Date('2024-01-01') },
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

    expect(data.exists).toBe(true);
    expect(data.applications.length).toBe(1);
    expect(data.applications[0].id).toBe('123');
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
    expect(data.error).toBe('Internal server error while checking candidate');
  });
});

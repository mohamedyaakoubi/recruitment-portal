import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from '../route';
import { NextRequest } from 'next/server';
import * as dateUtils from '@/lib/dateUtils';

// Mock Firestore and date utils
const mockGet = vi.fn();
const mockUpdate = vi.fn();
const mockDoc = vi.fn(() => ({
  get: mockGet,
  update: mockUpdate,
}));
const mockCollection = vi.fn(() => ({
  doc: mockDoc,
}));

vi.mock('@/lib/firebase-admin', () => ({
  getFirestoreAdmin: vi.fn(() => ({
    collection: mockCollection,
  })),
}));

vi.mock('firebase-admin', () => ({
  default: {
    firestore: {
      FieldValue: {
        serverTimestamp: vi.fn(() => 'TIMESTAMP'),
      },
    },
  },
}));

vi.mock('@/lib/dateUtils');

describe('PUT /api/update-candidate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when candidate ID is missing', async () => {
    const request = {
      json: async () => ({ updatedData: { firstName: 'John' } }),
    } as unknown as NextRequest;

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Candidate ID is required');
  });

  it('should return 400 when updated data is missing', async () => {
    const request = {
      json: async () => ({ candidateId: '123' }),
    } as unknown as NextRequest;

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Updated data is required');
  });

  it('should return 404 when candidate not found', async () => {
    mockGet.mockResolvedValue({ exists: false });

    const request = {
      json: async () => ({
        candidateId: '123',
        updatedData: { firstName: 'John' },
      }),
    } as unknown as NextRequest;

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Candidate not found');
  });

  it('should update candidate successfully', async () => {
    mockGet.mockResolvedValue({ exists: true });
    mockUpdate.mockResolvedValue(undefined);

    const request = {
      json: async () => ({
        candidateId: '123',
        updatedData: { firstName: 'John', lastName: 'Doe' },
      }),
    } as unknown as NextRequest;

    const response = await PUT(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.message).toBe('Candidate updated successfully');
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should calculate age when dateOfBirth is updated', async () => {
    mockGet.mockResolvedValue({ exists: true });
    mockUpdate.mockResolvedValue(undefined);
    vi.mocked(dateUtils.calculateAge).mockReturnValue(30);

    const request = {
      json: async () => ({
        candidateId: '123',
        updatedData: { dateOfBirth: '1994-01-01' },
      }),
    } as unknown as NextRequest;

    const response = await PUT(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(dateUtils.calculateAge).toHaveBeenCalledWith('1994-01-01');
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ age: 30 }));
  });

  it('should handle update errors', async () => {
    mockGet.mockResolvedValue({ exists: true });
    mockUpdate.mockRejectedValue(new Error('Update failed'));

    const request = {
      json: async () => ({
        candidateId: '123',
        updatedData: { firstName: 'John' },
      }),
    } as unknown as NextRequest;

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to update candidate');
  });
});

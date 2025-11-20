import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock Firestore
const mockGet = vi.fn();
const mockUpdate = vi.fn();
const mockDoc = vi.fn(() => ({
    get: mockGet,
    update: mockUpdate
}));
const mockCollection = vi.fn(() => ({
    doc: mockDoc
}));

vi.mock('@/lib/firebase-admin', () => ({
    getFirestoreAdmin: vi.fn(() => ({
        collection: mockCollection
    }))
}));

describe('POST /api/check-duplicate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 when required fields are missing', async () => {
        const request = {
            json: async () => ({ email: 'test@example.com' })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Email, jobId, and jobCategory are required');
    });

    it('should detect duplicate application to same job', async () => {
        const mockSnapshot = {
            empty: false,
            docs: [{
                data: () => ({
                    email: 'test@example.com',
                    jobTitle: 'frontend-dev',
                    submittedAt: { toDate: () => new Date('2024-01-15') }
                })
            }]
        };

        mockCollection.mockReturnValue({
            where: vi.fn().mockReturnThis(),
            get: vi.fn().mockResolvedValue(mockSnapshot)
        });

        const request = {
            json: async () => ({
                email: 'test@example.com',
                jobId: 'frontend-dev',
                jobCategory: 'Engineering'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(data.isDuplicate).toBe(true);
        expect(data.message).toContain('already applied');
    });

    it('should detect category limit exceeded', async () => {
        const mockDuplicateSnapshot = { empty: true };
        const mockCategorySnapshot = { size: 3 };

        const mockWhere = vi.fn().mockReturnThis();
        const mockGetFn = vi.fn()
            .mockResolvedValueOnce(mockDuplicateSnapshot)
            .mockResolvedValueOnce(mockCategorySnapshot);

        mockCollection.mockReturnValue({
            where: mockWhere,
            get: mockGetFn
        });

        const request = {
            json: async () => ({
                email: 'test@example.com',
                jobId: 'backend-dev',
                jobCategory: 'Engineering'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(data.isDuplicate).toBe(true);
        expect(data.message).toContain('maximum number of applications');
    });

    it('should allow application when no duplicates found', async () => {
        const mockDuplicateSnapshot = { empty: true };
        const mockCategorySnapshot = { size: 1 };

        const mockWhere = vi.fn().mockReturnThis();
        const mockGetFn = vi.fn()
            .mockResolvedValueOnce(mockDuplicateSnapshot)
            .mockResolvedValueOnce(mockCategorySnapshot);

        mockCollection.mockReturnValue({
            where: mockWhere,
            get: mockGetFn
        });

        const request = {
            json: async () => ({
                email: 'test@example.com',
                jobId: 'frontend-dev',
                jobCategory: 'Engineering'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(data.isDuplicate).toBe(false);
        expect(data.message).toBe('No duplicate applications found');
    });

    it('should handle database errors', async () => {
        mockCollection.mockReturnValue({
            where: vi.fn().mockReturnThis(),
            get: vi.fn().mockRejectedValue(new Error('Database error'))
        });

        const request = {
            json: async () => ({
                email: 'test@example.com',
                jobId: 'frontend-dev',
                jobCategory: 'Engineering'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error while checking duplicates');
    });
});

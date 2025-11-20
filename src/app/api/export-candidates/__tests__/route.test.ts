import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import * as candidateService from '@/services/candidate';

vi.mock('@/services/candidate');
vi.mock('@/lib/csvUtils', () => ({
    generateCSV: vi.fn((candidates) => `CSV data for ${candidates.length} candidates`)
}));

describe('GET /api/export-candidates', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should export candidates as CSV when format=csv', async () => {
        const mockCandidates = [
            { id: '1', fullName: 'John Doe', email: 'john@example.com' },
            { id: '2', fullName: 'Jane Smith', email: 'jane@example.com' }
        ];

        vi.mocked(candidateService.exportCandidates).mockResolvedValue(mockCandidates);

        const request = {
            url: 'http://localhost:3000/api/export-candidates?format=csv'
        } as NextRequest;

        const response = await GET(request);
        const text = await response.text();

        expect(response.headers.get('Content-Type')).toContain('text/csv');
        expect(text).toContain('CSV data');
    });

    it('should export candidates as JSON by default', async () => {
        const mockCandidates = [
            { id: '1', fullName: 'John Doe', email: 'john@example.com' }
        ];

        vi.mocked(candidateService.exportCandidates).mockResolvedValue(mockCandidates);

        const request = {
            url: 'http://localhost:3000/api/export-candidates'
        } as NextRequest;

        const response = await GET(request);
        const data = await response.json();

        expect(data.candidates).toBeDefined();
        expect(data.metadata).toBeDefined();
        expect(data.candidates.length).toBe(1);
    });

    it('should filter candidates by status', async () => {
        const mockCandidates = [
            { id: '1', fullName: 'John Doe', status: 'approved' }
        ];

        vi.mocked(candidateService.exportCandidates).mockResolvedValue(mockCandidates);

        const request = {
            url: 'http://localhost:3000/api/export-candidates?status=approved'
        } as NextRequest;

        const response = await GET(request);
        const data = await response.json();

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
            url: 'http://localhost:3000/api/export-candidates'
        } as NextRequest;

        const response = await GET(request);
        const data = await response.json();

        expect(data.candidates).toEqual([]);
        expect(data.metadata.totalCount).toBe(0);
    });

    it('should handle database errors', async () => {
        vi.mocked(candidateService.exportCandidates).mockRejectedValue(new Error('Database error'));

        const request = {
            url: 'http://localhost:3000/api/export-candidates'
        } as NextRequest;

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to export candidates');
    });
});

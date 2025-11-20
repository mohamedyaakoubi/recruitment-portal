import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as scoringService from '@/services/scoring';

vi.mock('@/services/scoring');

describe('POST /api/score-candidate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 when required fields missing', async () => {
        const request = {
            json: async () => ({ candidateId: '123' })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('required');
    });

    it('should score candidate successfully', async () => {
        const mockScore = {
            score: 85,
            analysis: 'Strong candidate',
            keyStrengths: ['Technical skills'],
            areasForImprovement: ['Leadership'],
            recommendation: 'recommended' as const
        };

        vi.mocked(scoringService.scoreCandidate).mockResolvedValue(mockScore);

        const request = {
            json: async () => ({
                candidateId: '123',
                jobTitle: 'Developer',
                jobDescription: 'Build apps'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(data.score).toBe(85);
        expect(data.analysis).toBeDefined();
    });

    it('should handle scoring errors', async () => {
        vi.mocked(scoringService.scoreCandidate).mockRejectedValue(new Error('Error'));

        const request = {
            json: async () => ({
                candidateId: '123',
                jobTitle: 'Developer',
                jobDescription: 'Build apps'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeDefined();
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as interviewService from '@/services/interview';

vi.mock('@/services/interview');

describe('POST /api/cancel-interview', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should cancel interview successfully', async () => {
        vi.mocked(interviewService.cancelInterview).mockResolvedValue(undefined);

        const request = {
            json: async () => ({
                candidateId: '123',
                reason: 'Candidate requested cancellation'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.message).toBe('Interview cancelled successfully');
        expect(interviewService.cancelInterview).toHaveBeenCalledWith(
            '123',
            'Candidate requested cancellation'
        );
    });

    it('should use default reason when not provided', async () => {
        vi.mocked(interviewService.cancelInterview).mockResolvedValue(undefined);

        const request = {
            json: async () => ({ candidateId: '123' })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(interviewService.cancelInterview).toHaveBeenCalledWith(
            '123',
            'Cancelled by admin'
        );
    });

    it('should handle cancellation errors', async () => {
        vi.mocked(interviewService.cancelInterview).mockRejectedValue(
            new Error('Cancellation failed')
        );

        const request = {
            json: async () => ({ candidateId: '123' })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to cancel interview');
    });
});

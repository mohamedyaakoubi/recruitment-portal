import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as emailService from '@/services/email';

vi.mock('@/services/email');

describe('POST /api/send-confirmation-email', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 when required fields missing', async () => {
        const request = {
            json: async () => ({ candidateEmail: 'test@example.com' })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('required');
    });

    it('should send confirmation email successfully', async () => {
        vi.mocked(emailService.sendApplicationConfirmationEmail).mockResolvedValue(undefined);

        const request = {
            json: async () => ({
                candidateEmail: 'test@example.com',
                candidateName: 'John Doe',
                jobTitle: 'Developer',
                applicationId: 'app123'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(emailService.sendApplicationConfirmationEmail).toHaveBeenCalled();
    });

    it('should handle email errors', async () => {
        vi.mocked(emailService.sendApplicationConfirmationEmail).mockRejectedValue(new Error('Error'));

        const request = {
            json: async () => ({
                candidateEmail: 'test@example.com',
                candidateName: 'John Doe',
                jobTitle: 'Developer',
                applicationId: 'app123'
            })
        } as unknown as NextRequest;

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeDefined();
    });
});

import { vi } from 'vitest';
import { verifyEmail } from '../emailVerification';

// Mock fetch globally
global.fetch = vi.fn();

describe('emailVerification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.ABSTRACT_API_KEY;
        delete process.env.HUNTER_API_KEY;
    });

    describe('verifyEmail - Basic Validation', () => {
        it('should reject invalid email format', async () => {
            const result = await verifyEmail('invalid-email');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Invalid email format');
        });

        it('should reject email without @', async () => {
            const result = await verifyEmail('invalidemail.com');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Invalid email format');
        });

        it('should reject email without domain', async () => {
            const result = await verifyEmail('test@');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Invalid email format');
        });

        it('should reject email with spaces', async () => {
            const result = await verifyEmail('test @example.com');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Invalid email format');
        });

        it('should pass basic validation for valid format', async () => {
            const result = await verifyEmail('test@example.com');

            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    describe('verifyEmail - Abstract API Integration', () => {
        beforeEach(() => {
            process.env.ABSTRACT_API_KEY = 'test-api-key';
        });

        it('should verify deliverable email via Abstract API', async () => {
            (global.fetch as vi.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    deliverability: 'DELIVERABLE',
                    is_disposable_email: { value: false },
                    is_role_email: { value: false }
                })
            });

            const result = await verifyEmail('valid@example.com');

            expect(result.isValid).toBe(true);
            expect(result.deliverable).toBe(true);
            expect(result.disposable).toBe(false);
            expect(result.role_account).toBe(false);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('emailvalidation.abstractapi.com'),
                expect.any(Object)
            );
        });

        it('should reject disposable email via Abstract API', async () => {
            (global.fetch as vi.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    deliverability: 'DELIVERABLE',
                    is_disposable_email: { value: true },
                    is_role_email: { value: false }
                })
            });

            const result = await verifyEmail('test@tempmail.com');

            expect(result.isValid).toBe(false);
            expect(result.disposable).toBe(true);
        });

        it('should reject undeliverable email via Abstract API', async () => {
            (global.fetch as vi.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    deliverability: 'UNDELIVERABLE',
                    is_disposable_email: { value: false },
                    is_role_email: { value: false }
                })
            });

            const result = await verifyEmail('invalid@example.com');

            expect(result.isValid).toBe(false);
            expect(result.deliverable).toBe(false);
        });

        it('should handle Abstract API errors gracefully', async () => {
            (global.fetch as vi.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            const result = await verifyEmail('test@example.com');

            // Should fallback to allowing email through
            expect(result.isValid).toBe(true);
            expect(result.error).toBe('Verification service temporarily unavailable');
        });

        it('should handle network errors', async () => {
            (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await verifyEmail('test@example.com');

            expect(result.isValid).toBe(true);
            expect(result.error).toBe('Verification service temporarily unavailable');
        });
    });

    describe('verifyEmail - Hunter API Integration', () => {
        beforeEach(() => {
            process.env.HUNTER_API_KEY = 'test-hunter-key';
        });

        it('should verify deliverable email via Hunter API', async () => {
            (global.fetch as vi.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: {
                        result: 'deliverable',
                        disposable: false,
                        role: false
                    }
                })
            });

            const result = await verifyEmail('valid@example.com');

            expect(result.isValid).toBe(true);
            expect(result.deliverable).toBe(true);
            expect(result.disposable).toBe(false);
            expect(result.role_account).toBe(false);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('api.hunter.io'),
                expect.any(Object)
            );
        });

        it('should reject undeliverable email via Hunter API', async () => {
            (global.fetch as vi.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: {
                        result: 'undeliverable',
                        disposable: false,
                        role: false
                    }
                })
            });

            const result = await verifyEmail('invalid@example.com');

            expect(result.isValid).toBe(false);
        });

        it('should handle Hunter API errors gracefully', async () => {
            (global.fetch as vi.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401
            });

            const result = await verifyEmail('test@example.com');

            expect(result.isValid).toBe(true);
            expect(result.error).toBe('Verification service temporarily unavailable');
        });
    });

    describe('verifyEmail - No API Keys Configured', () => {
        it('should use basic validation when no API keys are set', async () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const result = await verifyEmail('test@example.com');

            expect(result.isValid).toBe(true);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'No email verification API configured. Using basic validation only.'
            );

            consoleWarnSpy.mockRestore();
        });
    });

    describe('verifyEmail - Edge Cases', () => {
        it('should handle email with special characters', async () => {
            const result = await verifyEmail('test+tag@example.com');

            expect(result.isValid).toBe(true);
        });

        it('should handle email with subdomain', async () => {
            const result = await verifyEmail('test@mail.example.com');

            expect(result.isValid).toBe(true);
        });

        it('should handle email with numbers', async () => {
            const result = await verifyEmail('user123@example.com');

            expect(result.isValid).toBe(true);
        });

        it('should handle email with hyphens', async () => {
            const result = await verifyEmail('test-user@example.com');

            expect(result.isValid).toBe(true);
        });
    });
});

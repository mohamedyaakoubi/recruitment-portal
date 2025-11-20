import { vi, beforeEach, describe, it, expect } from 'vitest';
import {
    basicPhoneValidation,
    validatePhoneWithRegex,
    validatePhoneWithAbstractAPI,
    checkRateLimit,
    updateRateLimit
} from '../phoneValidationService';

// Mock fetch globally
global.fetch = vi.fn();

describe('phoneValidationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.ABSTRACT_PHONE_API_KEY;
    });

    describe('basicPhoneValidation', () => {
        it('should validate correct international phone number', () => {
            const result = basicPhoneValidation('+14155552671');
            expect(result.isValid).toBe(true);
            expect(result.phone).toBe('+14155552671');
            expect(result.fallbackUsed).toBe('basic');
        });

        it('should reject phone without + prefix', () => {
            const result = basicPhoneValidation('14155552671');
            expect(result.isValid).toBe(false);
        });

        it('should reject phone with less than 7 digits', () => {
            const result = basicPhoneValidation('+12345');
            expect(result.isValid).toBe(false);
        });
    });

    describe('validatePhoneWithRegex', () => {
        it('should validate US phone number', () => {
            const result = validatePhoneWithRegex('+14155552671');
            expect(result.isValid).toBe(true);
            expect(result.country?.code).toBe('1');
            expect(result.country?.name).toBe('United States/Canada');
        });

        it('should validate UK phone number', () => {
            const result = validatePhoneWithRegex('+447911123456');
            expect(result.isValid).toBe(true);
            expect(result.country?.code).toBe('44');
        });

        it('should reject unsupported country code', () => {
            const result = validatePhoneWithRegex('+9991234567890');
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Unsupported country code');
        });
    });

    describe('validatePhoneWithAbstractAPI', () => {
        beforeEach(() => {
            process.env.ABSTRACT_PHONE_API_KEY = 'test-api-key';
        });

        it('should validate phone via Abstract API', async () => {
            (global.fetch as vi.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify({
                    valid: true,
                    phone: '+14155552671',
                    country: { name: 'United States' }
                })
            });

            const result = await validatePhoneWithAbstractAPI('+14155552671');
            expect(result.isValid).toBe(true);
        });

        it('should throw error when API key is not configured', async () => {
            delete process.env.ABSTRACT_PHONE_API_KEY;
            await expect(validatePhoneWithAbstractAPI('+14155552671')).rejects.toThrow(
                'Abstract Phone API key not configured'
            );
        });
    });

    describe('checkRateLimit', () => {
        it('should allow first attempt', () => {
            const result = checkRateLimit('192.168.1.1', '+14155552671');
            expect(result.allowed).toBe(true);
            expect(result.attemptsLeft).toBe(3);
        });

        it('should block previously failed numbers', () => {
            const ip = '192.168.1.1';
            const phone = '+14155552671';

            updateRateLimit(ip, phone, false);
            const result = checkRateLimit(ip, phone);

            expect(result.allowed).toBe(false);
            expect(result.isFailedNumber).toBe(true);
        });
    });

    describe('updateRateLimit', () => {
        it('should track failed numbers', () => {
            const ip = '192.168.1.1';
            const phone = '+14155552671';

            updateRateLimit(ip, phone, false);
            const result = checkRateLimit(ip, phone);

            expect(result.isFailedNumber).toBe(true);
        });
    });
});

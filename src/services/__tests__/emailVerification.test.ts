import { vi } from 'vitest';
import { verifyEmail } from '../emailVerification';

// Mock fetch globally
global.fetch = vi.fn();

// Mock the email-validator-dns-provider-rules module
vi.mock('email-validator-dns-provider-rules', () => ({
  validateEmail: vi.fn(),
}));

// Mock dns/promises with default export
vi.mock('dns/promises', () => ({
  default: {},
  resolveMx: vi.fn(),
}));

import { validateEmail as validateEmailDNS } from 'email-validator-dns-provider-rules';

describe('emailVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ABSTRACT_API_KEY;
    delete process.env.HUNTER_API_KEY;
    // Default: DNS validation passes
    vi.mocked(validateEmailDNS).mockResolvedValue({ valid: true });
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

  describe('verifyEmail - DNS MX Validation (Layer 2)', () => {
    it('should reject email with no MX records', async () => {
      vi.mocked(validateEmailDNS).mockResolvedValue({
        valid: false,
        reasonId: 4,
        reasonText: 'domain after @ has no DNS MX records',
      });

      const result = await verifyEmail('test@nonexistent-domain.com');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no DNS MX records');
    });

    it('should reject email from blocklisted disposable domain', async () => {
      vi.mocked(validateEmailDNS).mockResolvedValue({
        valid: false,
        reasonId: 5,
        reasonText: 'email domain is in blocklist',
      });

      const result = await verifyEmail('test@tempmail.com');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('blocklist');
    });

    it('should reject email with invalid provider rules', async () => {
      vi.mocked(validateEmailDNS).mockResolvedValue({
        valid: false,
        reasonId: 6,
        reasonText: 'invalid username before @ by domain vendor rules',
      });

      const result = await verifyEmail('some_one@gmail.com');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('vendor rules');
    });

    it('should pass valid domain to Layer 3', async () => {
      vi.mocked(validateEmailDNS).mockResolvedValue({ valid: true });

      const result = await verifyEmail('test@gmail.com');

      expect(result.isValid).toBe(true);
      expect(validateEmailDNS).toHaveBeenCalled();
    });

    it('should continue to Layer 3 if DNS check throws error', async () => {
      vi.mocked(validateEmailDNS).mockRejectedValue(new Error('DNS error'));

      const result = await verifyEmail('test@example.com');

      // Should still pass as Layer 3 has no API configured
      expect(result.isValid).toBe(true);
    });
  });

  describe('verifyEmail - Abstract API Integration', () => {
    beforeEach(() => {
      process.env.ABSTRACT_API_KEY = 'test-api-key';
      // DNS validation passes by default
      vi.mocked(validateEmailDNS).mockResolvedValue({ valid: true });
    });

    it('should verify deliverable email via Abstract API', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          deliverability: 'DELIVERABLE',
          is_disposable_email: { value: false },
          is_role_email: { value: false },
        }),
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

    it('should reject disposable email at Layer 2 before API call', async () => {
      vi.mocked(validateEmailDNS).mockResolvedValue({
        valid: false,
        reasonId: 5,
        reasonText: 'email domain is in blocklist',
      });

      const result = await verifyEmail('test@tempmail.com');

      expect(result.isValid).toBe(false);
      // API should NOT be called since Layer 2 rejected
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should reject undeliverable email via Abstract API', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          deliverability: 'UNDELIVERABLE',
          is_disposable_email: { value: false },
          is_role_email: { value: false },
        }),
      });

      const result = await verifyEmail('invalid@example.com');

      expect(result.isValid).toBe(false);
      expect(result.deliverable).toBe(false);
    });

    it('should handle Abstract API errors gracefully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await verifyEmail('test@example.com');

      // Should fallback to allowing email through in dev mode
      expect(result.isValid).toBe(true);
      expect(result.error).toContain('Verification service temporarily unavailable');
    });

    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      const result = await verifyEmail('test@example.com');

      expect(result.isValid).toBe(true);
      expect(result.error).toContain('Verification service temporarily unavailable');
    });
  });

  describe('verifyEmail - Hunter API Integration', () => {
    beforeEach(() => {
      process.env.HUNTER_API_KEY = 'test-hunter-key';
      vi.mocked(validateEmailDNS).mockResolvedValue({ valid: true });
    });

    it('should verify deliverable email via Hunter API', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            result: 'deliverable',
            disposable: false,
            role: false,
          },
        }),
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
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            result: 'undeliverable',
            disposable: false,
            role: false,
          },
        }),
      });

      const result = await verifyEmail('invalid@example.com');

      expect(result.isValid).toBe(false);
    });

    it('should handle Hunter API errors gracefully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await verifyEmail('test@example.com');

      expect(result.isValid).toBe(true);
      expect(result.error).toContain('Verification service temporarily unavailable');
    });
  });

  describe('verifyEmail - No API Keys Configured', () => {
    it('should use basic validation when no API keys are set', async () => {
      vi.mocked(validateEmailDNS).mockResolvedValue({ valid: true });

      const result = await verifyEmail('test@example.com');

      expect(result.isValid).toBe(true);
    });
  });

  describe('verifyEmail - Edge Cases', () => {
    beforeEach(() => {
      vi.mocked(validateEmailDNS).mockResolvedValue({ valid: true });
    });

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

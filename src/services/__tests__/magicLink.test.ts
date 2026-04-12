import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock @upstash/redis so tests use the in-memory fallback
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => null),
}));

describe('Magic Link Service', () => {
  let generateMagicLinkToken: typeof import('../magicLink').generateMagicLinkToken;
  let verifyMagicLinkToken: typeof import('../magicLink').verifyMagicLinkToken;

  beforeEach(async () => {
    vi.resetModules();
    // No Redis env vars — forces in-memory fallback
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const mod = await import('../magicLink');
    generateMagicLinkToken = mod.generateMagicLinkToken;
    verifyMagicLinkToken = mod.verifyMagicLinkToken;
  });

  it('generates a 64-character hex token', async () => {
    const token = await generateMagicLinkToken({ email: 'test@example.com', dest: 'form' });
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('verifies a valid token and returns the payload', async () => {
    const token = await generateMagicLinkToken({ email: 'candidate@example.com', dest: 'choices' });
    const payload = await verifyMagicLinkToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.email).toBe('candidate@example.com');
    expect(payload?.dest).toBe('choices');
  });

  it('returns null for an unknown token', async () => {
    const result = await verifyMagicLinkToken('a'.repeat(64));
    expect(result).toBeNull();
  });

  it('invalidates a token after first use (one-time use)', async () => {
    const token = await generateMagicLinkToken({ email: 'once@example.com', dest: 'form' });
    const first = await verifyMagicLinkToken(token);
    expect(first).not.toBeNull();
    const second = await verifyMagicLinkToken(token);
    expect(second).toBeNull();
  });

  it('returns null for a token with wrong format', async () => {
    expect(await verifyMagicLinkToken('')).toBeNull();
    expect(await verifyMagicLinkToken('short')).toBeNull();
    expect(await verifyMagicLinkToken('Z'.repeat(64))).toBeNull(); // non-hex
  });
});

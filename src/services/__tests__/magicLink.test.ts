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

  it('allows re-verification within the short grace window', async () => {
    const token = await generateMagicLinkToken({ email: 'once@example.com', dest: 'form' });
    const first = await verifyMagicLinkToken(token);
    expect(first).not.toBeNull();
    // Second call within 60s still returns the payload (handles browser double-fetch)
    const second = await verifyMagicLinkToken(token);
    expect(second).not.toBeNull();
    expect(second?.email).toBe('once@example.com');
  });

  it('returns null for a token with wrong format', async () => {
    expect(await verifyMagicLinkToken('')).toBeNull();
    expect(await verifyMagicLinkToken('short')).toBeNull();
    expect(await verifyMagicLinkToken('Z'.repeat(64))).toBeNull(); // non-hex
  });

  it('falls back to in-memory when Redis operations throw', async () => {
    vi.resetModules();
    // Set env vars so getRedis() returns a Redis instance
    process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token';

    // Mock Redis to throw on all operations
    vi.doMock('@upstash/redis', () => ({
      Redis: vi.fn().mockImplementation(() => ({
        set: vi.fn().mockRejectedValue(new Error('fetch failed')),
        get: vi.fn().mockRejectedValue(new Error('fetch failed')),
        del: vi.fn().mockRejectedValue(new Error('fetch failed')),
      })),
    }));

    const mod = await import('../magicLink');
    const token = await mod.generateMagicLinkToken({
      email: 'redis-fail@example.com',
      dest: 'form',
    });
    expect(token).toMatch(/^[0-9a-f]{64}$/);

    const payload = await mod.verifyMagicLinkToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.email).toBe('redis-fail@example.com');
    expect(payload?.dest).toBe('form');

    // Clean up
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('handles Upstash auto-deserialized objects from Redis get', async () => {
    vi.resetModules();
    process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token';

    // Simulate Upstash auto-deserializing the JSON string into an object
    let storedValue: unknown = null;
    vi.doMock('@upstash/redis', () => ({
      Redis: vi.fn().mockImplementation(() => ({
        set: vi.fn().mockImplementation((_k: string, v: unknown) => {
          storedValue = JSON.parse(v as string); // Upstash auto-parses JSON
          return Promise.resolve('OK');
        }),
        get: vi.fn().mockImplementation(() => Promise.resolve(storedValue)),
        del: vi.fn().mockImplementation(() => {
          storedValue = null;
          return Promise.resolve(1);
        }),
      })),
    }));

    const mod = await import('../magicLink');
    const token = await mod.generateMagicLinkToken({
      email: 'upstash@example.com',
      dest: 'choices',
    });
    const payload = await mod.verifyMagicLinkToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.email).toBe('upstash@example.com');
    expect(payload?.dest).toBe('choices');

    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });
});

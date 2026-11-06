import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';

// Mock the Redis module
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    ping: vi.fn().mockResolvedValue('PONG'),
    set: vi.fn().mockResolvedValue('OK'),
  })),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('GET /api/redis-keepalive', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return success when Redis is configured and responds', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    delete process.env.REDIS_KEEPALIVE_SECRET;

    const request = new NextRequest('http://localhost:3000/api/redis-keepalive');

    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Redis database pinged successfully');
    expect(result.data.pingResult).toBe('PONG');
    expect(result.data.lastPing).toBeDefined();
  });

  it('should return 503 when Redis is not configured', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.REDIS_KEEPALIVE_SECRET;

    const request = new NextRequest('http://localhost:3000/api/redis-keepalive');

    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(503);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Redis not configured');
  });

  it('should return 401 when secret is configured but not provided', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    process.env.REDIS_KEEPALIVE_SECRET = 'my-secret';

    const request = new NextRequest('http://localhost:3000/api/redis-keepalive');

    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('should return 401 when secret is configured but wrong token provided', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    process.env.REDIS_KEEPALIVE_SECRET = 'my-secret';

    const request = new NextRequest('http://localhost:3000/api/redis-keepalive', {
      headers: {
        Authorization: 'Bearer wrong-secret',
      },
    });

    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('should return success when correct secret is provided', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    process.env.REDIS_KEEPALIVE_SECRET = 'my-secret';

    const request = new NextRequest('http://localhost:3000/api/redis-keepalive', {
      headers: {
        Authorization: 'Bearer my-secret',
      },
    });

    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
  });

  it('should handle Redis errors gracefully', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    delete process.env.REDIS_KEEPALIVE_SECRET;

    // Re-mock Redis to throw an error
    vi.doMock('@upstash/redis', () => ({
      Redis: vi.fn().mockImplementation(() => ({
        ping: vi.fn().mockRejectedValue(new Error('Connection failed')),
        set: vi.fn(),
      })),
    }));

    // Re-import the route to pick up new mock
    vi.resetModules();
    const { GET: GET2 } = await import('../route');

    const request = new NextRequest('http://localhost:3000/api/redis-keepalive');

    const response = await GET2(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to ping Redis');
  });
});

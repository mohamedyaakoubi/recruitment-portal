/**
 * Redis Keep-Alive Endpoint
 *
 * This endpoint pings the Upstash Redis database to keep it active.
 * Upstash archives free-tier databases that remain inactive for extended periods.
 *
 * Recommended: Set up an external cron job to call this endpoint every 2 weeks.
 * Options:
 * - cron-job.org (free)
 * - GitHub Actions scheduled workflow
 * - Vercel Cron Jobs (if deployed on Vercel)
 *
 * Example cron expression for every 2 weeks: 0 0 1,15 * *
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import logger from '@/lib/logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  // Read secret dynamically to support testing
  const keepaliveSecret = process.env.REDIS_KEEPALIVE_SECRET;

  // Optional: Verify authorization if secret is configured
  if (keepaliveSecret) {
    const authHeader = request.headers.get('authorization');
    const providedToken = authHeader?.replace('Bearer ', '');

    if (providedToken !== keepaliveSecret) {
      logger.warn('Redis keepalive: Unauthorized access attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!upstashUrl || !upstashToken) {
    logger.warn('Redis keepalive: Redis not configured');
    return NextResponse.json(
      {
        success: false,
        error: 'Redis not configured',
        message: 'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required',
      },
      { status: 503 }
    );
  }

  try {
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });

    // Perform a simple PING command to keep the database active
    const pingResult = await redis.ping();

    // Also set a keepalive timestamp key to have actual data activity
    const timestamp = new Date().toISOString();
    await redis.set('_keepalive:last_ping', timestamp);

    const duration = Date.now() - startTime;

    logger.info('Redis keepalive: Ping successful', {
      pingResult,
      timestamp,
      duration,
    });

    return NextResponse.json({
      success: true,
      message: 'Redis database pinged successfully',
      data: {
        pingResult,
        lastPing: timestamp,
        duration: `${duration}ms`,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Redis keepalive: Ping failed', error, { duration });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to ping Redis',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

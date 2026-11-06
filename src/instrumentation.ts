/**
 * Next.js Instrumentation
 * Runs once when the server starts up
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run on Node.js runtime (not Edge runtime)
    const { validateAndLogEnvironment } = await import('./lib/env-validation');

    try {
      validateAndLogEnvironment();
    } catch (error) {
      // Log error and let application continue in development
      // In production, this will fail the build/startup
      console.error('Environment validation error:', error);
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }
}

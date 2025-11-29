import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/googleOAuth';
import { requireAdminAuth } from '@/lib/auth';
import logger from '@/lib/logger';
import { ApiErrors } from '@/lib/apiResponse';

// TODO: For distributed deployments (multiple server instances),
// replace in-memory state storage with Redis or database solution
// to ensure OAuth state consistency across instances.
export async function GET(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const authUrl = generateAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    logger.error('Error generating Google auth URL', error);
    return ApiErrors.internal('Failed to initiate Google authentication', error);
  }
}

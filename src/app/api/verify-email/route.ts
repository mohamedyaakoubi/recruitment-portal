import { NextRequest } from 'next/server';
import { verifyEmail } from '@/services/emailVerification';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return ApiErrors.badRequest('Email is required');
    }

    const verificationResult = await verifyEmail(email);

    return successResponse(verificationResult);
  } catch (error) {
    logger.error('Email verification error', error);
    return ApiErrors.internal('Internal server error during email verification', error);
  }
}

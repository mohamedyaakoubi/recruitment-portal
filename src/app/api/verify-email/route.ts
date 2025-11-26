import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/services/emailVerification';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const verificationResult = await verifyEmail(email);

    return NextResponse.json(verificationResult);
  } catch (error) {
    logger.error('Email verification error', error);
    return NextResponse.json(
      { error: 'Internal server error during email verification' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/googleOAuth';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const authUrl = generateAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    logger.error('Error generating Google auth URL', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google authentication.' },
      { status: 500 }
    );
  }
}

// src/app/api/send-rejection-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendRejectionEmail } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const { candidateEmail, candidateName, jobTitle } = await request.json();

    await sendRejectionEmail(candidateEmail, candidateName, jobTitle);

    console.log(`Rejection email sent to ${candidateEmail}`);
    return NextResponse.json({ success: true, message: 'Rejection email sent successfully' });

  } catch (error) {
    console.error('Error sending rejection email:', error);
    return NextResponse.json(
      { error: 'Failed to send rejection email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
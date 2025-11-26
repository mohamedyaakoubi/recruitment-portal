import { NextRequest, NextResponse } from 'next/server';
import { sendApplicationConfirmationEmail } from '@/services/email';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { candidateEmail, candidateName, jobTitle, jobCategory, specialty, applicationId } =
      await request.json();

    // Validate required fields
    if (!candidateEmail || !candidateName || !jobTitle || !applicationId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: candidateEmail, candidateName, jobTitle, and applicationId are required',
        },
        { status: 400 }
      );
    }

    // Generate submission date
    const submissionDate = new Date();

    // Send confirmation email
    await sendApplicationConfirmationEmail({
      candidateEmail,
      candidateName,
      jobTitle,
      jobCategory,
      specialty,
      applicationId,
      submissionDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
    });
  } catch (error) {
    logger.error('Error in send-confirmation-email API', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send confirmation email',
      },
      { status: 500 }
    );
  }
}

import { NextRequest } from 'next/server';
import { sendApplicationConfirmationEmail } from '@/services/email';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { requireAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
    const { candidateEmail, candidateName, jobTitle, jobCategory, specialty, applicationId } =
      await request.json();

    // Validate required fields
    if (!candidateEmail || !candidateName || !jobTitle || !applicationId) {
      return ApiErrors.badRequest(
        'Missing required fields: candidateEmail, candidateName, jobTitle, and applicationId are required'
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

    return successResponse({ applicationId }, { message: 'Confirmation email sent successfully' });
  } catch (error) {
    logger.error('Error in send-confirmation-email API', error);
    return ApiErrors.internal('Failed to send confirmation email', error);
  }
}

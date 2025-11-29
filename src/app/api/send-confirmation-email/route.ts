import { NextRequest } from 'next/server';
import { sendApplicationConfirmationEmail } from '@/services/email';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { requireAdminAuth } from '@/lib/auth';
import { withCsrfProtection } from '@/lib/csrf-middleware';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';

export const POST = withCsrfProtection(async (request: NextRequest) => {
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

    // Log admin operation
    const context = extractSecurityContext(request);
    logSecurityEvent({
      type: SecurityEventType.ADMIN_EMAIL_SENT,
      ...context,
      details: { applicationId, emailType: 'confirmation', recipient: candidateEmail },
    });

    return successResponse({ applicationId }, { message: 'Confirmation email sent successfully' });
  } catch (error) {
    logger.error('Error in send-confirmation-email API', error);
    return ApiErrors.internal('Failed to send confirmation email', error);
  }
});

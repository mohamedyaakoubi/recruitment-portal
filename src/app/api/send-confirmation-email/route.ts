import { NextRequest } from 'next/server';
import { validateOrigin, getOriginValidationError } from '@/lib/origin-validation';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import { z } from 'zod';

// Validation schema for confirmation email
const confirmationEmailSchema = z.object({
  candidateEmail: z.string().email().max(254),
  candidateName: z.string().min(1).max(200),
  jobTitle: z.string().min(1).max(200),
  jobCategory: z.string().max(200).optional(),
  specialty: z.string().max(200).optional(),
  applicationId: z.string().min(1).max(200),
});

// Mark as dynamic to prevent static optimization during build
export const dynamic = 'force-dynamic';

/**
 * Public endpoint for sending application confirmation emails
 * Note: This is called from client-side after successful form submission
 * Rate limiting is enforced by middleware
 */
export async function POST(request: NextRequest) {
  // Validate request origin for additional security
  if (!validateOrigin(request)) {
    const error = getOriginValidationError();
    return ApiErrors.forbidden(error.error);
  }

  try {
    const body = await request.json();
    const validatedData = confirmationEmailSchema.safeParse(body);

    if (!validatedData.success) {
      // Audit log validation failure
      const context = extractSecurityContext(request);
      logSecurityEvent({
        type: SecurityEventType.INPUT_VALIDATION_FAILED,
        ...context,
        details: {
          endpoint: '/api/send-confirmation-email',
          errors: validatedData.error.flatten(),
        },
      });
      return ApiErrors.badRequest('Validation failed', validatedData.error.flatten());
    }

    const { candidateEmail, candidateName, jobTitle, jobCategory, specialty, applicationId } =
      validatedData.data;

    // Generate submission date
    const submissionDate = new Date();

    // Dynamically import email service to prevent build-time issues
    const { sendApplicationConfirmationEmail } = await import('@/services/email');

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

    // Log email sent (without admin context since this is public)
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
}

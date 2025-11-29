import { NextRequest } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { validateOrigin, getOriginValidationError } from '@/lib/origin-validation';
import logger from '@/lib/logger';
import { checkDuplicateSchema } from '@/lib/validations';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';

export async function POST(request: NextRequest) {
  // Validate request origin for additional security
  if (!validateOrigin(request)) {
    const error = getOriginValidationError();
    return ApiErrors.forbidden(error.error);
  }

  try {
    const body = await request.json();
    const validatedData = checkDuplicateSchema.safeParse(body);

    if (!validatedData.success) {
      // Audit log validation failure
      const context = extractSecurityContext(request);
      logSecurityEvent({
        type: SecurityEventType.INPUT_VALIDATION_FAILED,
        ...context,
        details: { endpoint: '/api/check-duplicate', errors: validatedData.error.flatten() },
      });
      return ApiErrors.badRequest('Validation failed', validatedData.error.flatten());
    }

    const { email, jobId, jobCategory } = validatedData.data;

    const db = getFirestoreAdmin();
    const candidatesRef = db.collection('candidates');

    // Check for applications to the same specific job in the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const duplicateQuery = candidatesRef
      .where('email', '==', email)
      .where('jobTitle', '==', jobId)
      .where('submittedAt', '>=', sixMonthsAgo);

    const duplicateSnapshot = await duplicateQuery.get();

    if (!duplicateSnapshot.empty) {
      const lastApplicationDoc = duplicateSnapshot.docs[0];
      if (!lastApplicationDoc) {
        return successResponse({
          isDuplicate: false,
          message: 'No duplicate applications found',
          lastApplicationDate: null,
        });
      }
      const lastApplication = lastApplicationDoc.data();
      const lastSubmissionDate = lastApplication.submittedAt?.toDate();

      return successResponse({
        isDuplicate: true,
        message: `You have already applied for this position on ${lastSubmissionDate?.toLocaleDateString()}. You can apply again after 6 months.`,
        lastApplicationDate: lastSubmissionDate?.toISOString(),
      });
    }

    // Check for category limit (max 3 applications per category per month)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const categoryQuery = candidatesRef
      .where('email', '==', email)
      .where('jobCategory', '==', jobCategory)
      .where('submittedAt', '>=', thirtyDaysAgo);

    const categorySnapshot = await categoryQuery.get();

    if (categorySnapshot.size >= 3) {
      return successResponse({
        isDuplicate: true,
        message: `You have reached the maximum number of applications (3) for the "${jobCategory}" category this month.`,
        lastApplicationDate: null,
      });
    }

    return successResponse({
      isDuplicate: false,
      message: 'No duplicate applications found',
      lastApplicationDate: null,
    });
  } catch (error) {
    logger.error('Check duplicate error', error);
    return ApiErrors.internal('Internal server error while checking duplicates', error);
  }
}

// src/app/api/jobs/route.ts
import { NextRequest } from 'next/server';
import { getJobs, createJob, updateJob, deleteJob } from '@/services/jobs';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { jobSchema, jobUpdateSchema } from '@/lib/validations';
import { requireAdminAuth } from '@/lib/auth';
import { withCsrfProtection } from '@/lib/csrf-middleware';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const { jobs, categories } = await getJobs(activeOnly);
    return successResponse({ jobs, categories });
  } catch (error) {
    logger.error('Error fetching jobs', error);
    return ApiErrors.internal('Failed to fetch jobs', error);
  }
}

export const POST = withCsrfProtection(async (request: NextRequest) => {
  // Require admin authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validatedData = jobSchema.safeParse(body);

    if (!validatedData.success) {
      return ApiErrors.badRequest('Validation failed', validatedData.error.flatten());
    }

    const { jobId } = await createJob(validatedData.data);

    // Log admin operation
    const context = extractSecurityContext(request);
    logSecurityEvent({
      type: SecurityEventType.ADMIN_JOB_CREATED,
      ...context,
      details: { jobId, jobTitle: validatedData.data.title },
    });

    return successResponse({ jobId }, { message: 'Job created successfully' });
  } catch (error) {
    logger.error('Error creating job', error);
    return ApiErrors.internal('Failed to create job', error);
  }
});

export const PUT = withCsrfProtection(async (request: NextRequest) => {
  // Require admin authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validatedData = jobUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return ApiErrors.badRequest('Validation failed', validatedData.error.flatten());
    }

    const { jobId, ...jobData } = validatedData.data;
    await updateJob(jobId, jobData);

    // Log admin operation
    const context = extractSecurityContext(request);
    logSecurityEvent({
      type: SecurityEventType.ADMIN_JOB_UPDATED,
      ...context,
      details: { jobId, updatedFields: Object.keys(jobData) },
    });

    return successResponse({ jobId }, { message: 'Job updated successfully' });
  } catch (error) {
    logger.error('Error updating job', error);
    return ApiErrors.internal('Failed to update job', error);
  }
});

export const DELETE = withCsrfProtection(async (request: NextRequest) => {
  // Require admin authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return ApiErrors.badRequest('Job ID is required');
    }

    await deleteJob(jobId);

    // Log admin operation
    const context = extractSecurityContext(request);
    logSecurityEvent({
      type: SecurityEventType.ADMIN_JOB_DELETED,
      ...context,
      details: { jobId },
    });

    return successResponse({ jobId }, { message: 'Job deleted successfully' });
  } catch (error) {
    logger.error('Error deleting job', error);
    return ApiErrors.internal('Failed to delete job', error);
  }
});

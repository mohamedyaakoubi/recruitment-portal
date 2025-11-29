// src/app/api/jobs/route.ts
import { NextRequest } from 'next/server';
import { getJobs, createJob, updateJob, deleteJob } from '@/services/jobs';
import logger from '@/lib/logger';
import { successResponse, ApiErrors } from '@/lib/apiResponse';
import { jobSchema, jobUpdateSchema } from '@/lib/validations';
import { requireAdminAuth } from '@/lib/auth';

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

export async function POST(request: NextRequest) {
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
    return successResponse({ jobId }, { message: 'Job created successfully' });
  } catch (error) {
    logger.error('Error creating job', error);
    return ApiErrors.internal('Failed to create job', error);
  }
}

export async function PUT(request: NextRequest) {
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
    return successResponse({ jobId }, { message: 'Job updated successfully' });
  } catch (error) {
    logger.error('Error updating job', error);
    return ApiErrors.internal('Failed to update job', error);
  }
}

export async function DELETE(request: NextRequest) {
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
    return successResponse({ jobId }, { message: 'Job deleted successfully' });
  } catch (error) {
    logger.error('Error deleting job', error);
    return ApiErrors.internal('Failed to delete job', error);
  }
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Job } from '@/types';
import logger from '@/lib/logger';

interface JobsResponse {
  jobs: Job[];
  categories: string[];
}

// Fetch jobs
async function fetchJobs(activeOnly: boolean = true): Promise<JobsResponse> {
  const response = await fetch(`/api/jobs?activeOnly=${activeOnly}`);
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  return response.json();
}

// Create job
async function createJobApi(jobData: Partial<Job>): Promise<{ jobId: string }> {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create job');
  }
  return response.json();
}

// Update job
async function updateJobApi(jobId: string, jobData: Partial<Job>): Promise<void> {
  const response = await fetch('/api/jobs', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, ...jobData }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update job');
  }
}

// Delete job
async function deleteJobApi(jobId: string): Promise<void> {
  const response = await fetch(`/api/jobs?jobId=${jobId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete job');
  }
}

/**
 * Hook for fetching jobs with caching
 */
export function useJobs(activeOnly: boolean = true) {
  return useQuery({
    queryKey: ['jobs', { activeOnly }],
    queryFn: () => fetchJobs(activeOnly),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating a new job
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJobApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      logger.info('Job created successfully');
    },
    onError: (error) => {
      logger.error('Failed to create job', error);
    },
  });
}

/**
 * Hook for updating a job
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: Partial<Job> }) =>
      updateJobApi(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      logger.info('Job updated successfully');
    },
    onError: (error) => {
      logger.error('Failed to update job', error);
    },
  });
}

/**
 * Hook for deleting a job
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJobApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      logger.info('Job deleted successfully');
    },
    onError: (error) => {
      logger.error('Failed to delete job', error);
    },
  });
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { JOB_CATEGORIES } from '@/lib/job-categories';

// Mock jobs service BEFORE importing route
vi.mock('@/services/jobs', () => ({
  getJobs: vi.fn(),
  createJob: vi.fn(),
  updateJob: vi.fn(),
  deleteJob: vi.fn(),
}));

// Mock auth module
vi.mock('@/lib/auth', () => ({
  requireAdminAuth: vi.fn(async () => null),
  isAdminAuthenticated: vi.fn(async () => true),
  getUserFromRequest: vi.fn(() => ({ id: 'test-admin', ip: 'test-ip' })),
}));

import * as jobsService from '@/services/jobs';

describe('GET /api/jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return job listings successfully', async () => {
    const mockJobs = [
      {
        id: 'frontend-dev',
        title: 'Frontend Developer',
        category: 'Development & IT' as const,
        description: 'Test description',
        specialties: ['React', 'TypeScript'],
        isActive: true,
      },
      {
        id: 'backend-dev',
        title: 'Backend Developer',
        category: 'Development & IT' as const,
        description: 'Test description',
        specialties: ['Node.js', 'Python'],
        isActive: true,
      },
    ];

    vi.mocked(jobsService.getJobs).mockResolvedValue({
      jobs: mockJobs,
      categories: JOB_CATEGORIES,
    });

    const request = {
      url: 'http://localhost:3000/api/jobs',
    } as NextRequest;

    const response = await GET(request);
    const result = await response.json();

    expect(result.data.jobs).toEqual(mockJobs);
    expect(result.data.categories).toEqual(JOB_CATEGORIES);
    expect(jobsService.getJobs).toHaveBeenCalledWith(false);
  });

  it('should filter active jobs only', async () => {
    vi.mocked(jobsService.getJobs).mockResolvedValue({
      jobs: [],
      categories: JOB_CATEGORIES,
    });

    const request = {
      url: 'http://localhost:3000/api/jobs?activeOnly=true',
    } as NextRequest;

    const response = await GET(request);
    await response.json();

    expect(jobsService.getJobs).toHaveBeenCalledWith(true);
  });

  it('should return empty arrays when no jobs', async () => {
    vi.mocked(jobsService.getJobs).mockResolvedValue({
      jobs: [],
      categories: JOB_CATEGORIES,
    });

    const request = {
      url: 'http://localhost:3000/api/jobs',
    } as NextRequest;

    const response = await GET(request);
    const result = await response.json();

    expect(result.data.jobs).toEqual([]);
    expect(result.data.categories).toEqual(JOB_CATEGORIES);
  });

  it('should handle database errors', async () => {
    vi.mocked(jobsService.getJobs).mockRejectedValue(new Error('Database error'));

    const request = {
      url: 'http://localhost:3000/api/jobs',
    } as NextRequest;

    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.error).toBe('Failed to fetch jobs');
  });
});

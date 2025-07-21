
const mockCollection = {
  orderBy: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
  add: jest.fn(),
  doc: jest.fn().mockReturnThis(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
};

jest.mock('@/lib/firebase-admin', () => ({
  getFirestoreAdmin: jest.fn().mockReturnValue(mockDb),
}));

import { JOB_CATEGORIES } from '@/lib/job-categories';

describe('Job Service', () => {
  let getJobs: any, createJob: any, updateJob: any, deleteJob: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const jobs = require('../jobs');
    getJobs = jobs.getJobs;
    createJob = jobs.createJob;
    updateJob = jobs.updateJob;
    deleteJob = jobs.deleteJob;
  });

  describe('getJobs', () => {
    it('should return jobs and categories', async () => {
      const mockJobs = [
        { id: '1', title: 'Job 1', category: 'Development & IT', specialties: ['Frontend'] },
        { id: '2', title: 'Job 2', category: 'Services', specialties: ['UX'] },
      ];
      mockCollection.get.mockResolvedValue({
        docs: mockJobs.map(job => ({ id: job.id, data: () => job })),
      });

      const { jobs, categories } = await getJobs();

      expect(jobs).toEqual(mockJobs.map(j => ({...j, specialties: j.specialties || []})));
      expect(categories).toEqual(JOB_CATEGORIES);
      expect(mockDb.collection).toHaveBeenCalledWith('jobs');
      expect(mockCollection.orderBy).toHaveBeenCalledWith('category');
      expect(mockCollection.orderBy).toHaveBeenCalledWith('title');
    });

    it('should filter by active jobs if activeOnly is true', async () => {
      mockCollection.get.mockResolvedValue({ docs: [] });
      await getJobs(true);
      expect(mockCollection.where).toHaveBeenCalledWith('isActive', '==', true);
    });
  });

  describe('createJob', () => {
    it('should create a new job', async () => {
      const jobData = {
        title: 'New Job',
        description: 'A new job',
        category: 'Development & IT',
        specialties: ['Frontend'],
      };
      const mockJobRef = { id: 'new-job-id' };
      mockCollection.add.mockResolvedValue(mockJobRef);

      const { jobId } = await createJob(jobData as any);

      expect(jobId).toBe(mockJobRef.id);
      expect(mockCollection.add).toHaveBeenCalledWith(expect.objectContaining({
        ...jobData,
        isActive: true,
      }));
    });

    it('should throw an error for missing required fields', async () => {
      await expect(createJob({} as any)).rejects.toThrow('Missing title, description, category, or specialties');
    });

    it('should throw an error for invalid category', async () => {
        const jobData = {
            title: 'New Job',
            description: 'A new job',
            category: 'Invalid Category',
            specialties: ['Frontend'],
          };
      await expect(createJob(jobData as any)).rejects.toThrow('Invalid category');
    });
  });

  describe('updateJob', () => {
    it('should update a job', async () => {
      const jobId = 'job-1';
      const jobData = { title: 'Updated Title' };
      await updateJob(jobId, jobData);
      expect(mockCollection.doc).toHaveBeenCalledWith(jobId);
      expect(mockCollection.update).toHaveBeenCalledWith(expect.objectContaining({
        ...jobData,
      }));
    });

    it('should throw an error for missing jobId', async () => {
      await expect(updateJob('', {})).rejects.toThrow('Missing jobId');
    });

    it('should throw an error for invalid category', async () => {
        await expect(updateJob('job-1', { category: 'Invalid Category' })).rejects.toThrow('Invalid category');
      });
  });

  describe('deleteJob', () => {
    it('should delete a job', async () => {
      const jobId = 'job-1';
      await deleteJob(jobId);
      expect(mockCollection.doc).toHaveBeenCalledWith(jobId);
      expect(mockCollection.delete).toHaveBeenCalled();
    });

    it('should throw an error for missing jobId', async () => {
      await expect(deleteJob('')).rejects.toThrow('Missing jobId');
    });
  });
});

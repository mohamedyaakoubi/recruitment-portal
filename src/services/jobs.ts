// src/services/jobs.ts
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { JOB_CATEGORIES } from '@/lib/job-categories';
import { Job } from '@/types';
import admin from 'firebase-admin';

const db = getFirestoreAdmin();
const jobsCollection = db.collection('jobs');

export const getJobs = async (
  activeOnly = false
): Promise<{ jobs: Job[]; categories: typeof JOB_CATEGORIES }> => {
  let query = jobsCollection.orderBy('category').orderBy('title');

  if (activeOnly) {
    query = query.where('isActive', '==', true);
  }

  const jobsSnapshot = await query.get();

  const jobs = jobsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      specialties: data.specialties || [],
    } as Job;
  });

  return { jobs, categories: JOB_CATEGORIES };
};

export const createJob = async (jobData: Omit<Job, 'id'>): Promise<{ jobId: string }> => {
  const { title, description, category, specialties } = jobData;

  if (
    !title ||
    !description ||
    !category ||
    !specialties ||
    !Array.isArray(specialties) ||
    specialties.length === 0
  ) {
    throw new Error('Missing title, description, category, or specialties');
  }

  if (!JOB_CATEGORIES.includes(category)) {
    throw new Error('Invalid category');
  }

  const validSpecialties = specialties.filter((spec) => spec && spec.trim() !== '');
  if (validSpecialties.length === 0) {
    throw new Error('At least one specialty is required');
  }

  const jobRef = await jobsCollection.add({
    ...jobData,
    specialties: validSpecialties,
    createdAt: admin.firestore.Timestamp.now(),
    isActive: true,
  });

  return { jobId: jobRef.id };
};

export const updateJob = async (jobId: string, jobData: Partial<Job>): Promise<void> => {
  if (!jobId) {
    throw new Error('Missing jobId');
  }

  if (jobData.category && !JOB_CATEGORIES.includes(jobData.category)) {
    throw new Error('Invalid category');
  }

  const updateData: Record<string, unknown> = {
    ...jobData,
    updatedAt: admin.firestore.Timestamp.now(),
  };

  if (jobData.specialties !== undefined) {
    if (!Array.isArray(jobData.specialties)) {
      throw new Error('Specialties must be an array');
    }
    const validSpecialties = jobData.specialties.filter((spec) => spec && spec.trim() !== '');
    if (validSpecialties.length === 0) {
      throw new Error('At least one specialty is required');
    }
    updateData.specialties = validSpecialties;
  }

  await jobsCollection.doc(jobId).update(updateData);
};

export const deleteJob = async (jobId: string): Promise<void> => {
  if (!jobId) {
    throw new Error('Missing jobId');
  }

  await jobsCollection.doc(jobId).delete();
};

/**
 * Jobs Service Integration Tests
 * Tests job CRUD operations with real Firestore emulator
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { initializeTestFirebase, cleanupTestFirebase, clearFirestoreData } from '../setup';
import { createTestJob, TestJob } from '../helpers';
import type { Firestore } from 'firebase/firestore';

describe('Jobs Service Integration', () => {
  let db: Firestore;

  beforeAll(async () => {
    const { db: testDb } = await initializeTestFirebase();
    db = testDb;
  });

  afterAll(async () => {
    await cleanupTestFirebase();
  });

  beforeEach(async () => {
    await clearFirestoreData();
  });

  describe('Create Job', () => {
    it('should create a job with all fields', async () => {
      const jobId = await createTestJob(db, {
        title: 'Senior Software Engineer',
        category: 'Engineering',
        specialty: 'Backend',
        description: 'We are looking for a senior backend engineer.',
        isActive: true,
      });

      expect(jobId).toBeDefined();

      const jobRef = doc(db, 'jobs', jobId);
      const jobSnap = await getDoc(jobRef);

      expect(jobSnap.exists()).toBe(true);
      const data = jobSnap.data();
      expect(data?.title).toBe('Senior Software Engineer');
      expect(data?.category).toBe('Engineering');
      expect(data?.specialty).toBe('Backend');
      expect(data?.isActive).toBe(true);
    });

    it('should create multiple jobs in different categories', async () => {
      await createTestJob(db, { title: 'Frontend Developer', category: 'Engineering' });
      await createTestJob(db, { title: 'Product Manager', category: 'Product' });
      await createTestJob(db, { title: 'UX Designer', category: 'Design' });

      const jobsRef = collection(db, 'jobs');
      const snapshot = await getDocs(jobsRef);

      expect(snapshot.size).toBe(3);

      const categories = snapshot.docs.map((doc) => doc.data().category);
      expect(categories).toContain('Engineering');
      expect(categories).toContain('Product');
      expect(categories).toContain('Design');
    });
  });

  describe('Query Jobs', () => {
    it('should get all active jobs', async () => {
      await createTestJob(db, { title: 'Active Job 1', isActive: true });
      await createTestJob(db, { title: 'Active Job 2', isActive: true });
      await createTestJob(db, { title: 'Inactive Job', isActive: false });

      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);

      expect(snapshot.size).toBe(2);
      snapshot.docs.forEach((doc) => {
        expect(doc.data().isActive).toBe(true);
      });
    });

    it('should filter jobs by category', async () => {
      await createTestJob(db, { title: 'Engineer 1', category: 'Engineering' });
      await createTestJob(db, { title: 'Engineer 2', category: 'Engineering' });
      await createTestJob(db, { title: 'Designer', category: 'Design' });

      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, where('category', '==', 'Engineering'));
      const snapshot = await getDocs(q);

      expect(snapshot.size).toBe(2);
    });

    it('should order jobs by creation date', async () => {
      // Create jobs with slight delay to ensure different timestamps
      await createTestJob(db, { title: 'First Job' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await createTestJob(db, { title: 'Second Job' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await createTestJob(db, { title: 'Third Job' });

      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const titles = snapshot.docs.map((doc) => doc.data().title);
      expect(titles[0]).toBe('Third Job');
      expect(titles[2]).toBe('First Job');
    });
  });

  describe('Update Job', () => {
    it('should update job title', async () => {
      const jobId = await createTestJob(db, { title: 'Old Title' });

      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, { title: 'New Title' });

      const updatedSnap = await getDoc(jobRef);
      expect(updatedSnap.data()?.title).toBe('New Title');
    });

    it('should toggle job active status', async () => {
      const jobId = await createTestJob(db, { isActive: true });

      const jobRef = doc(db, 'jobs', jobId);

      // Deactivate
      await updateDoc(jobRef, { isActive: false });
      let snap = await getDoc(jobRef);
      expect(snap.data()?.isActive).toBe(false);

      // Reactivate
      await updateDoc(jobRef, { isActive: true });
      snap = await getDoc(jobRef);
      expect(snap.data()?.isActive).toBe(true);
    });
  });

  describe('Delete Job', () => {
    it('should delete a job', async () => {
      const jobId = await createTestJob(db, { title: 'To Be Deleted' });

      // Verify exists
      const jobRef = doc(db, 'jobs', jobId);
      let snap = await getDoc(jobRef);
      expect(snap.exists()).toBe(true);

      // Delete
      await deleteDoc(jobRef);

      // Verify deleted
      snap = await getDoc(jobRef);
      expect(snap.exists()).toBe(false);
    });
  });
});

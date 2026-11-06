/**
 * Candidate Service Integration Tests
 * Tests candidate CRUD operations with real Firestore emulator
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { initializeTestFirebase, cleanupTestFirebase, clearFirestoreData } from '../setup';
import {
  createTestCandidate,
  createTestCandidates,
  generateTestEmail,
  TestCandidate,
} from '../helpers';
import type { Firestore } from 'firebase/firestore';

describe('Candidate Service Integration', () => {
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

  describe('Create Candidate', () => {
    it('should create a candidate with all required fields', async () => {
      const email = generateTestEmail();
      const candidateId = await createTestCandidate(db, {
        email,
        fullName: 'John Doe',
        status: 'submitted',
      });

      expect(candidateId).toBeDefined();
      expect(typeof candidateId).toBe('string');

      // Verify in database
      const candidateRef = doc(db, 'candidates', candidateId);
      const candidateSnap = await getDoc(candidateRef);

      expect(candidateSnap.exists()).toBe(true);
      const data = candidateSnap.data();
      expect(data?.email).toBe(email);
      expect(data?.fullName).toBe('John Doe');
      expect(data?.status).toBe('submitted');
    });

    it('should create multiple candidates', async () => {
      const ids = await createTestCandidates(db, 5);

      expect(ids).toHaveLength(5);

      // Verify all exist
      const candidatesRef = collection(db, 'candidates');
      const snapshot = await getDocs(candidatesRef);

      expect(snapshot.size).toBe(5);
    });

    it('should store timestamps correctly', async () => {
      const candidateId = await createTestCandidate(db, {
        email: generateTestEmail(),
        submittedAt: Timestamp.now(),
      });

      const candidateRef = doc(db, 'candidates', candidateId);
      const candidateSnap = await getDoc(candidateRef);
      const data = candidateSnap.data();

      expect(data?.submittedAt).toBeInstanceOf(Timestamp);
      expect(data?.submittedAt.toDate()).toBeInstanceOf(Date);
    });
  });

  describe('Query Candidates', () => {
    it('should find candidate by email', async () => {
      const email = generateTestEmail();
      await createTestCandidate(db, { email, fullName: 'Test User' });

      const candidatesRef = collection(db, 'candidates');
      const q = query(candidatesRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      expect(snapshot.size).toBe(1);
      expect(snapshot.docs[0].data().fullName).toBe('Test User');
    });

    it('should filter candidates by status', async () => {
      await createTestCandidates(db, 3, { status: 'submitted' });
      await createTestCandidates(db, 2, { status: 'interview_scheduled' });
      await createTestCandidates(db, 1, { status: 'rejected' });

      const candidatesRef = collection(db, 'candidates');

      // Query submitted
      const submittedQuery = query(candidatesRef, where('status', '==', 'submitted'));
      const submittedSnap = await getDocs(submittedQuery);
      expect(submittedSnap.size).toBe(3);

      // Query interview_scheduled
      const interviewQuery = query(candidatesRef, where('status', '==', 'interview_scheduled'));
      const interviewSnap = await getDocs(interviewQuery);
      expect(interviewSnap.size).toBe(2);

      // Query rejected
      const rejectedQuery = query(candidatesRef, where('status', '==', 'rejected'));
      const rejectedSnap = await getDocs(rejectedQuery);
      expect(rejectedSnap.size).toBe(1);
    });

    it('should return empty result for non-existent email', async () => {
      await createTestCandidate(db, { email: 'exists@example.com' });

      const candidatesRef = collection(db, 'candidates');
      const q = query(candidatesRef, where('email', '==', 'nonexistent@example.com'));
      const snapshot = await getDocs(q);

      expect(snapshot.empty).toBe(true);
    });
  });

  describe('Update Candidate', () => {
    it('should update candidate status', async () => {
      const candidateId = await createTestCandidate(db, { status: 'submitted' });

      const candidateRef = doc(db, 'candidates', candidateId);
      await updateDoc(candidateRef, { status: 'reviewed' });

      const updatedSnap = await getDoc(candidateRef);
      expect(updatedSnap.data()?.status).toBe('reviewed');
    });

    it('should update candidate with interview details', async () => {
      const candidateId = await createTestCandidate(db, { status: 'submitted' });
      const interviewDate = Timestamp.fromDate(new Date('2025-12-01T10:00:00Z'));

      const candidateRef = doc(db, 'candidates', candidateId);
      await updateDoc(candidateRef, {
        status: 'interview_scheduled',
        interviewDate,
        meetLink: 'https://meet.google.com/abc-defg-hij',
        calendarEventId: 'event123',
        duration: 60,
      });

      const updatedSnap = await getDoc(candidateRef);
      const data = updatedSnap.data();

      expect(data?.status).toBe('interview_scheduled');
      expect(data?.interviewDate).toBeInstanceOf(Timestamp);
      expect(data?.meetLink).toBe('https://meet.google.com/abc-defg-hij');
      expect(data?.calendarEventId).toBe('event123');
      expect(data?.duration).toBe(60);
    });

    it('should update candidate score', async () => {
      const candidateId = await createTestCandidate(db, { score: null });

      const candidateRef = doc(db, 'candidates', candidateId);
      await updateDoc(candidateRef, {
        score: 85,
        scoreAnalysis: 'Strong technical background with relevant experience.',
        lastScoredAt: Timestamp.now(),
      });

      const updatedSnap = await getDoc(candidateRef);
      const data = updatedSnap.data();

      expect(data?.score).toBe(85);
      expect(data?.scoreAnalysis).toBe('Strong technical background with relevant experience.');
      expect(data?.lastScoredAt).toBeInstanceOf(Timestamp);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all fields on partial update', async () => {
      const originalData: Partial<TestCandidate> = {
        email: generateTestEmail(),
        fullName: 'Original Name',
        phoneNumber: '+1234567890',
        city: 'New York',
        status: 'submitted',
      };

      const candidateId = await createTestCandidate(db, originalData);

      // Partial update
      const candidateRef = doc(db, 'candidates', candidateId);
      await updateDoc(candidateRef, { status: 'reviewed' });

      // Verify original fields preserved
      const updatedSnap = await getDoc(candidateRef);
      const data = updatedSnap.data();

      expect(data?.email).toBe(originalData.email);
      expect(data?.fullName).toBe('Original Name');
      expect(data?.phoneNumber).toBe('+1234567890');
      expect(data?.city).toBe('New York');
      expect(data?.status).toBe('reviewed'); // Only this changed
    });

    it('should handle special characters in data', async () => {
      const specialData = {
        fullName: "O'Connor & Associates",
        city: 'São Paulo',
        scoreAnalysis: 'Excellent skills: "TypeScript", <React>, & more!',
      };

      const candidateId = await createTestCandidate(db, {
        email: generateTestEmail(),
        ...specialData,
      });

      const candidateRef = doc(db, 'candidates', candidateId);
      const candidateSnap = await getDoc(candidateRef);
      const data = candidateSnap.data();

      expect(data?.fullName).toBe(specialData.fullName);
      expect(data?.city).toBe(specialData.city);
      expect(data?.scoreAnalysis).toBe(specialData.scoreAnalysis);
    });
  });
});

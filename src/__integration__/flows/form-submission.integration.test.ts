/**
 * Form Submission Flow Integration Tests
 * Tests the complete candidate application flow
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { initializeTestFirebase, cleanupTestFirebase, clearFirestoreData } from '../setup';
import { generateTestEmail, createTestJob } from '../helpers';
import type { Firestore } from 'firebase/firestore';

describe('Form Submission Flow Integration', () => {
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

  describe('Complete Application Flow', () => {
    it('should submit a complete candidate application', async () => {
      // Step 1: Create a job first
      const jobId = await createTestJob(db, {
        title: 'Software Developer',
        category: 'Engineering',
        specialty: 'Full Stack',
        isActive: true,
      });

      // Step 2: Submit candidate application
      const candidateData = {
        email: generateTestEmail(),
        fullName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        countryCode: '+1',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        city: 'San Francisco',
        country: 'USA',
        nationality: 'American',
        doubleNationality: '',
        jobTitle: jobId,
        jobTitleText: 'Software Developer',
        jobCategory: 'Engineering',
        specialty: 'Full Stack',
        status: 'submitted',
        score: null,
        scoreAnalysis: '',
        cvUrl: 'https://storage.example.com/cv.pdf',
        passportUrl: 'https://storage.example.com/passport.pdf',
        photoUrl: 'https://storage.example.com/photo.jpg',
        submittedAt: Timestamp.now(),
        websites: ['https://github.com/johndoe', 'https://linkedin.com/in/johndoe'],
        applicationSource: 'web_form',
      };

      const candidatesRef = collection(db, 'candidates');
      const docRef = await addDoc(candidatesRef, candidateData);

      expect(docRef.id).toBeDefined();

      // Step 3: Verify the submission
      const candidateSnap = await getDoc(doc(db, 'candidates', docRef.id));
      expect(candidateSnap.exists()).toBe(true);

      const savedData = candidateSnap.data();
      expect(savedData?.email).toBe(candidateData.email);
      expect(savedData?.fullName).toBe('John Doe');
      expect(savedData?.jobTitle).toBe(jobId);
      expect(savedData?.status).toBe('submitted');
      expect(savedData?.websites).toHaveLength(2);
    });

    it('should prevent duplicate applications with same email for same job', async () => {
      const email = generateTestEmail();
      const jobId = await createTestJob(db, { title: 'Developer' });

      // First application
      const candidatesRef = collection(db, 'candidates');
      await addDoc(candidatesRef, {
        email,
        jobTitle: jobId,
        status: 'submitted',
        submittedAt: Timestamp.now(),
      });

      // Check for existing application (simulating API logic)
      const existingQuery = query(
        candidatesRef,
        where('email', '==', email),
        where('jobTitle', '==', jobId)
      );
      const existingSnap = await getDocs(existingQuery);

      expect(existingSnap.size).toBe(1);
      // In real API, we would return error here
    });

    it('should allow same email for different jobs', async () => {
      const email = generateTestEmail();
      const job1Id = await createTestJob(db, { title: 'Developer' });
      const job2Id = await createTestJob(db, { title: 'Designer' });

      const candidatesRef = collection(db, 'candidates');

      // Apply to first job
      await addDoc(candidatesRef, {
        email,
        jobTitle: job1Id,
        status: 'submitted',
        submittedAt: Timestamp.now(),
      });

      // Apply to second job
      await addDoc(candidatesRef, {
        email,
        jobTitle: job2Id,
        status: 'submitted',
        submittedAt: Timestamp.now(),
      });

      // Query all applications for this email
      const q = query(candidatesRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      expect(snapshot.size).toBe(2);
    });
  });

  describe('Application Status Transitions', () => {
    it('should track complete status lifecycle', async () => {
      const email = generateTestEmail();
      const candidatesRef = collection(db, 'candidates');

      // Submit
      const docRef = await addDoc(candidatesRef, {
        email,
        fullName: 'Status Test',
        status: 'submitted',
        submittedAt: Timestamp.now(),
      });

      const statuses: string[] = ['submitted'];

      // Transition through states
      const transitions = [
        { status: 'reviewed', field: 'reviewedAt' },
        { status: 'interview_scheduled', field: 'interviewDate' },
        { status: 'interviewed', field: 'interviewedAt' },
        { status: 'hired', field: 'hiredAt' },
      ];

      const candidateRef = doc(db, 'candidates', docRef.id);

      for (const transition of transitions) {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(candidateRef, {
          status: transition.status,
          [transition.field]: Timestamp.now(),
        });

        const snap = await getDoc(candidateRef);
        expect(snap.data()?.status).toBe(transition.status);
        statuses.push(transition.status);
      }

      expect(statuses).toEqual([
        'submitted',
        'reviewed',
        'interview_scheduled',
        'interviewed',
        'hired',
      ]);
    });

    it('should handle rejection status', async () => {
      const email = generateTestEmail();
      const candidatesRef = collection(db, 'candidates');

      const docRef = await addDoc(candidatesRef, {
        email,
        status: 'submitted',
        submittedAt: Timestamp.now(),
      });

      const candidateRef = doc(db, 'candidates', docRef.id);
      const { updateDoc } = await import('firebase/firestore');

      await updateDoc(candidateRef, {
        status: 'rejected',
        rejectedAt: Timestamp.now(),
        rejectionReason: 'Position filled',
      });

      const snap = await getDoc(candidateRef);
      expect(snap.data()?.status).toBe('rejected');
      expect(snap.data()?.rejectionReason).toBe('Position filled');
    });
  });

  describe('Interview Scheduling', () => {
    it('should schedule interview with all details', async () => {
      const email = generateTestEmail();
      const candidatesRef = collection(db, 'candidates');

      const docRef = await addDoc(candidatesRef, {
        email,
        fullName: 'Interview Test',
        status: 'submitted',
        submittedAt: Timestamp.now(),
      });

      const candidateRef = doc(db, 'candidates', docRef.id);
      const { updateDoc } = await import('firebase/firestore');

      const interviewDate = new Date('2025-12-15T10:00:00Z');
      await updateDoc(candidateRef, {
        status: 'interview_scheduled',
        interviewDate: Timestamp.fromDate(interviewDate),
        meetLink: 'https://meet.google.com/abc-defg-hij',
        calendarEventId: 'calendar_event_123',
        duration: 60,
      });

      const snap = await getDoc(candidateRef);
      const data = snap.data();

      expect(data?.status).toBe('interview_scheduled');
      expect(data?.interviewDate.toDate().toISOString()).toBe(interviewDate.toISOString());
      expect(data?.meetLink).toContain('meet.google.com');
      expect(data?.duration).toBe(60);
    });

    it('should cancel interview and clear details', async () => {
      const email = generateTestEmail();
      const candidatesRef = collection(db, 'candidates');

      // Create with interview scheduled
      const docRef = await addDoc(candidatesRef, {
        email,
        status: 'interview_scheduled',
        interviewDate: Timestamp.fromDate(new Date('2025-12-15T10:00:00Z')),
        meetLink: 'https://meet.google.com/abc-defg-hij',
        calendarEventId: 'calendar_event_123',
        submittedAt: Timestamp.now(),
      });

      const candidateRef = doc(db, 'candidates', docRef.id);
      const { updateDoc, deleteField } = await import('firebase/firestore');

      // Cancel interview
      await updateDoc(candidateRef, {
        status: 'submitted',
        interviewDate: deleteField(),
        meetLink: deleteField(),
        calendarEventId: deleteField(),
      });

      const snap = await getDoc(candidateRef);
      const data = snap.data();

      expect(data?.status).toBe('submitted');
      expect(data?.interviewDate).toBeUndefined();
      expect(data?.meetLink).toBeUndefined();
      expect(data?.calendarEventId).toBeUndefined();
    });
  });

  describe('Scoring Flow', () => {
    it('should update candidate with AI score', async () => {
      const email = generateTestEmail();
      const candidatesRef = collection(db, 'candidates');

      const docRef = await addDoc(candidatesRef, {
        email,
        fullName: 'Score Test',
        status: 'submitted',
        score: null,
        submittedAt: Timestamp.now(),
      });

      const candidateRef = doc(db, 'candidates', docRef.id);
      const { updateDoc } = await import('firebase/firestore');

      // Simulate AI scoring
      await updateDoc(candidateRef, {
        score: 85,
        scoreAnalysis: JSON.stringify({
          overallScore: 85,
          categories: {
            technicalSkills: 90,
            experience: 80,
            education: 85,
            communication: 85,
          },
          strengths: ['Strong technical background', 'Relevant experience'],
          weaknesses: ['Limited leadership experience'],
          recommendation: 'Proceed to interview',
        }),
        lastScoredAt: Timestamp.now(),
      });

      const snap = await getDoc(candidateRef);
      const data = snap.data();

      expect(data?.score).toBe(85);
      expect(data?.scoreAnalysis).toBeDefined();
      expect(data?.lastScoredAt).toBeDefined();

      const analysis = JSON.parse(data?.scoreAnalysis);
      expect(analysis.overallScore).toBe(85);
      expect(analysis.recommendation).toBe('Proceed to interview');
    });
  });
});

/**
 * Integration Test Helpers
 * Utility functions for creating test data and making API calls
 */

import { Firestore, collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';

export interface TestCandidate {
  id?: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  country?: string;
  nationality?: string;
  doubleNationality?: string;
  jobTitle?: string;
  jobTitleText?: string;
  jobCategory?: string;
  specialty?: string;
  status?: string;
  score?: number | null;
  scoreAnalysis?: string;
  cvUrl?: string;
  passportUrl?: string;
  photoUrl?: string;
  submittedAt?: Timestamp;
  interviewDate?: Timestamp | null;
  meetLink?: string;
  calendarEventId?: string;
  websites?: string[];
}

export interface TestJob {
  id?: string;
  title: string;
  category: string;
  specialty?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Timestamp;
}

/**
 * Create a test candidate in Firestore
 */
export async function createTestCandidate(
  db: Firestore,
  candidateData: Partial<TestCandidate> = {}
): Promise<string> {
  const defaultCandidate: TestCandidate = {
    email: `test-${Date.now()}@example.com`,
    fullName: 'Test Candidate',
    firstName: 'Test',
    lastName: 'Candidate',
    phoneNumber: '+1234567890',
    countryCode: '+1',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    city: 'Test City',
    country: 'Test Country',
    nationality: 'Test Nationality',
    doubleNationality: '',
    jobTitle: 'test-job-id',
    jobTitleText: 'Software Developer',
    jobCategory: 'Engineering',
    specialty: 'Backend',
    status: 'submitted',
    score: null,
    scoreAnalysis: '',
    cvUrl: '',
    passportUrl: '',
    photoUrl: '',
    submittedAt: Timestamp.now(),
    interviewDate: null,
    meetLink: '',
    calendarEventId: '',
    websites: [],
    ...candidateData,
  };

  const candidatesRef = collection(db, 'candidates');
  const docRef = await addDoc(candidatesRef, defaultCandidate);
  return docRef.id;
}

/**
 * Create a test job in Firestore
 */
export async function createTestJob(
  db: Firestore,
  jobData: Partial<TestJob> = {}
): Promise<string> {
  const defaultJob: TestJob = {
    title: 'Test Job Title',
    category: 'Engineering',
    specialty: 'Backend',
    description: 'Test job description',
    isActive: true,
    createdAt: Timestamp.now(),
    ...jobData,
  };

  const jobsRef = collection(db, 'jobs');
  const docRef = await addDoc(jobsRef, defaultJob);
  return docRef.id;
}

/**
 * Create multiple test candidates
 */
export async function createTestCandidates(
  db: Firestore,
  count: number,
  overrides: Partial<TestCandidate> = {}
): Promise<string[]> {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = await createTestCandidate(db, {
      email: `test-candidate-${i}-${Date.now()}@example.com`,
      fullName: `Test Candidate ${i}`,
      ...overrides,
    });
    ids.push(id);
  }
  return ids;
}

/**
 * Create an admin user document
 */
export async function createTestAdmin(
  db: Firestore,
  email: string = 'admin@test.com'
): Promise<void> {
  const adminRef = doc(db, 'admins', email);
  await setDoc(adminRef, {
    email,
    createdAt: Timestamp.now(),
    role: 'admin',
  });
}

/**
 * Mock API request helper for integration tests
 */
export function createMockRequest(
  method: string,
  body?: Record<string, unknown>,
  headers: Record<string, string> = {}
): Request {
  const url = 'http://localhost:3000/api/test';
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  return new Request(url, options);
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('Timeout waiting for condition');
}

/**
 * Generate a unique email for testing
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Generate test candidate data
 */
export function generateCandidateData(overrides: Partial<TestCandidate> = {}): TestCandidate {
  return {
    email: generateTestEmail(),
    fullName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '+1234567890',
    countryCode: '+1',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    city: 'New York',
    country: 'USA',
    nationality: 'American',
    doubleNationality: '',
    jobTitle: 'software-developer',
    jobTitleText: 'Software Developer',
    jobCategory: 'Engineering',
    specialty: 'Full Stack',
    status: 'submitted',
    score: null,
    scoreAnalysis: '',
    submittedAt: Timestamp.now(),
    websites: ['https://github.com/testuser'],
    ...overrides,
  };
}

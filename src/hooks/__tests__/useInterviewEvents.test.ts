import { vi } from 'vitest';

import { renderHook } from '@testing-library/react';
import { useInterviewEvents } from '../useInterviewEvents';
import { Candidate } from '@/types';

// Mock current date to be July 21, 2025
const MOCK_NOW = new Date('2025-07-21T12:00:00Z');
vi.useFakeTimers().setSystemTime(MOCK_NOW);

const mockCandidates: Candidate[] = [
  // Upcoming interview
  { 
    id: '1', 
    fullName: 'Upcoming Candidate', 
    interviewDate: { toDate: () => new Date('2025-08-01T10:00:00Z') }, 
    duration: 60,
    email: '',
    status: 'interview_scheduled',
    score: 0,
    scoreAnalysis: '',
    calendarEventId: '',
    meetLink: '',
    phone: '',
    availability: [],
    city: '',
    country: '',
    linkedin: '',
    github: '',
    resume: '',
    coverLetter: '',
    jobTitle: '',
    jobCategory: '',
    yearsOfExperience: 0,
    skills: [],
    referral: '',
    source: '',
    startDate: '',
    comments: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Completed interview
  { 
    id: '2', 
    fullName: 'Completed Candidate', 
    interviewDate: { toDate: () => new Date('2025-07-20T14:00:00Z') }, 
    duration: 30,
    email: '',
    status: 'interview_scheduled',
    score: 0,
    scoreAnalysis: '',
    calendarEventId: '',
    meetLink: '',
    phone: '',
    availability: [],
    city: '',
    country: '',
    linkedin: '',
    github: '',
    resume: '',
    coverLetter: '',
    jobTitle: '',
    jobCategory: '',
    yearsOfExperience: 0,
    skills: [],
    referral: '',
    source: '',
    startDate: '',
    comments: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // No interview date
  { 
    id: '3', 
    fullName: 'No Interview Candidate', 
    interviewDate: null,
    email: '',
    status: 'submitted',
    score: 0,
    scoreAnalysis: '',
    calendarEventId: '',
    meetLink: '',
    duration: 0,
    phone: '',
    availability: [],
    city: '',
    country: '',
    linkedin: '',
    github: '',
    resume: '',
    coverLetter: '',
    jobTitle: '',
    jobCategory: '',
    yearsOfExperience: 0,
    skills: [],
    referral: '',
    source: '',
    startDate: '',
    comments: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

describe('useInterviewEvents', () => {
  it('should return all events when filter is "all"', () => {
    const { result } = renderHook(() => useInterviewEvents(mockCandidates, 'all'));
    expect(result.current.allInterviewEvents.length).toBe(2);
    expect(result.current.filteredInterviewEvents.length).toBe(2);
  });

  it('should correctly identify completed and upcoming events', () => {
    const { result } = renderHook(() => useInterviewEvents(mockCandidates, 'all'));
    const upcomingEvent = result.current.allInterviewEvents.find(e => e.resource.id === '1');
    const completedEvent = result.current.allInterviewEvents.find(e => e.resource.id === '2');

    expect(upcomingEvent?.isCompleted).toBe(false);
    expect(upcomingEvent?.title).toBe('Interview: Upcoming Candidate');
    expect(completedEvent?.isCompleted).toBe(true);
    expect(completedEvent?.title).toBe('✓ Completed: Completed Candidate');
  });

  it('should filter for upcoming events', () => {
    const { result } = renderHook(() => useInterviewEvents(mockCandidates, 'upcoming'));
    expect(result.current.filteredInterviewEvents.length).toBe(1);
    expect(result.current.filteredInterviewEvents[0].resource.id).toBe('1');
  });

  it('should filter for completed events', () => {
    const { result } = renderHook(() => useInterviewEvents(mockCandidates, 'completed'));
    expect(result.current.filteredInterviewEvents.length).toBe(1);
    expect(result.current.filteredInterviewEvents[0].resource.id).toBe('2');
  });

  it('should handle an empty candidate list', () => {
    const { result } = renderHook(() => useInterviewEvents([], 'all'));
    expect(result.current.allInterviewEvents.length).toBe(0);
    expect(result.current.filteredInterviewEvents.length).toBe(0);
  });
});

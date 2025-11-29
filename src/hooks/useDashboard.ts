'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCandidates } from '@/hooks/useCandidates';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { useDashboardModals } from '@/hooks/useDashboardModals';
import { useDashboardToast } from '@/hooks/useDashboardToast';
import { Timestamp } from 'firebase/firestore';
import type { Candidate, InterviewEvent } from '@/types';
import { isBefore } from 'date-fns';
import logger from '@/lib/logger';

export const useDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // Tab state (not in filters hook since it's used independently)
  const [activeTab, setActiveTab] = useState<string>('main');

  // Calendar filter state
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  // Check for mock mode (for E2E tests)
  const [useMock, setUseMock] = useState(false);
  const [mockCandidates, setMockCandidates] = useState<Candidate[]>([]);

  // Fetch real candidates using useCandidates hook
  const { candidates: realCandidates, loadingCandidates: realLoadingCandidates } = useCandidates(
    user && !useMock ? user : null
  );

  // Determine which candidates to use
  const candidates = useMock ? mockCandidates : realCandidates;
  const loadingCandidates = useMock ? false : realLoadingCandidates;

  // Use composable hooks
  const filters = useDashboardFilters(candidates, activeTab);
  const modals = useDashboardModals();
  const { toast, setToast, showToast } = useDashboardToast();

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin-dashboard-secret/login');
    }
  }, [user, authLoading, router]);

  // Initialize mock data if needed (for E2E tests)
  useEffect(() => {
    if (user) {
      const mockMode =
        typeof window !== 'undefined' && window.localStorage.getItem('USE_MOCK_DATA') === 'true';
      setUseMock(mockMode);
      logger.info('useDashboard: Checking mock mode', { useMock: mockMode, user: user.email });

      if (mockMode) {
        logger.info('useDashboard: Using mock data');
        const mockData: Candidate[] = [
          {
            id: '1',
            fullName: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '+1234567890',
            dateOfBirth: '1990-01-01',
            nationality: 'US',
            gender: 'Male',
            city: 'New York',
            country: 'USA',
            jobCategory: 'Healthcare',
            jobTitleText: 'Nurse',
            status: 'submitted',
            submittedAt: { toMillis: () => Date.now() - 86400000 } as unknown as Timestamp,
            score: 85,
            cvUrl: 'http://example.com/cv.pdf',
            passportUrl: 'http://example.com/passport.jpg',
            websites: [],
          },
          {
            id: '2',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            phoneNumber: '+0987654321',
            dateOfBirth: '1992-02-02',
            nationality: 'UK',
            gender: 'Female',
            city: 'London',
            country: 'UK',
            jobCategory: 'Engineering',
            jobTitleText: 'Software Engineer',
            status: 'interview_scheduled',
            interviewDate: {
              toDate: () => new Date(Date.now() + 86400000),
            } as unknown as Timestamp,
            submittedAt: { toMillis: () => Date.now() - 172800000 } as unknown as Timestamp,
            score: 92,
            cvUrl: 'http://example.com/cv.pdf',
            passportUrl: 'http://example.com/passport.jpg',
            websites: [],
          },
        ];
        setMockCandidates(mockData);
      }
    }
  }, [user]);

  // Calendar events with completion status
  const allInterviewEvents: InterviewEvent[] = useMemo(() => {
    const now = new Date();

    return candidates
      .filter((c) => c.interviewDate)
      .map((c) => {
        const interviewStart = c.interviewDate!.toDate();
        const duration = c.duration || 30;
        const interviewEnd = new Date(interviewStart.getTime() + duration * 60 * 1000);
        const isCompleted = isBefore(interviewEnd, now);

        return {
          title: isCompleted ? `✓ Completed: ${c.fullName}` : `Interview: ${c.fullName}`,
          start: interviewStart,
          end: interviewEnd,
          resource: c,
          isCompleted,
          eventType: isCompleted ? ('completed' as const) : ('scheduled' as const),
        };
      });
  }, [candidates]);

  // Filtered calendar events
  const filteredInterviewEvents = useMemo(() => {
    switch (calendarFilter) {
      case 'upcoming':
        return allInterviewEvents.filter((event) => !event.isCompleted);
      case 'completed':
        return allInterviewEvents.filter((event) => event.isCompleted);
      default:
        return allInterviewEvents;
    }
  }, [allInterviewEvents, calendarFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = candidates.length;
    const submitted = candidates.filter((c) => c.status === 'submitted').length;
    const scheduled = candidates.filter((c) => c.status === 'interview_scheduled').length;
    const rejected = candidates.filter((c) => c.status === 'rejected').length;
    const approved = candidates.filter((c) => c.status === 'approved').length;

    return {
      total,
      submitted,
      scheduled,
      rejected,
      approved,
    };
  }, [candidates]);

  return {
    // Auth
    user,
    authLoading,
    signOut,

    // Data
    candidates,
    loadingCandidates,

    // Tab and calendar
    activeTab,
    setActiveTab,
    calendarFilter,
    setCalendarFilter,

    // Calendar events
    allInterviewEvents,
    filteredInterviewEvents,

    // Stats
    stats,

    // Spread filter hook exports
    ...filters,

    // Spread modal hook exports
    ...modals,

    // Toast
    toast,
    setToast,
    showToast,
  };
};

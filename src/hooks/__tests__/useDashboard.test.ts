import { vi } from 'vitest';

import { renderHook, act } from '@testing-library/react';
import { useDashboard } from '../useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/lib/firebase', () => ({ db: vi.fn() }));
vi.mock('firebase/firestore');
vi.mock('next/navigation');
vi.mock('@/lib/dashboardUtils');

const mockUseAuth = useAuth as vi.Mock;
const mockUseRouter = useRouter as vi.Mock;
const mockPush = vi.fn();
const mockOnSnapshot = onSnapshot as vi.Mock;

const mockCandidates: Candidate[] = [
    { id: '1', fullName: 'John Doe', status: 'submitted', city: 'New York', country: 'USA', nationality: 'American', jobTitleText: 'Frontend Developer', jobCategory: 'Engineering', dateOfBirth: '1990-01-01', specialty: 'React', interviewDate: { toDate: () => new Date('2025-08-01T10:00:00Z') }, duration: 60, email: '', score: 0, scoreAnalysis: '', calendarEventId: '', meetLink: '', phone: '', availability: [], linkedin: '', github: '', resume: '', coverLetter: '', jobTitle: '', yearsOfExperience: 0, skills: [], referral: '', source: '', startDate: '', comments: '', createdAt: new Date(), updatedAt: new Date(), submittedAt: { toMillis: () => 1000 } },
    { id: '2', fullName: 'Alice Smith', status: 'approved', city: 'London', country: 'UK', nationality: 'British', jobTitleText: 'Backend Developer', jobCategory: 'Engineering', dateOfBirth: '1995-05-05', specialty: 'Node.js', interviewDate: { toDate: () => new Date('2025-07-20T14:00:00Z') }, duration: 30, email: '', score: 0, scoreAnalysis: '', calendarEventId: '', meetLink: '', phone: '', availability: [], linkedin: '', github: '', resume: '', coverLetter: '', jobTitle: '', yearsOfExperience: 0, skills: [], referral: '', source: '', startDate: '', comments: '', createdAt: new Date(), updatedAt: new Date(), submittedAt: { toMillis: () => 2000 } },
    { id: '3', fullName: 'Bob Johnson', status: 'rejected', city: 'New York', country: 'USA', nationality: 'American', jobTitleText: 'UI/UX Designer', jobCategory: 'Design', dateOfBirth: '1988-03-15', specialty: 'Figma', interviewDate: null, email: '', score: 0, scoreAnalysis: '', calendarEventId: '', meetLink: '', duration: 0, phone: '', availability: [], linkedin: '', github: '', resume: '', coverLetter: '', jobTitle: '', yearsOfExperience: 0, skills: [], referral: '', source: '', startDate: '', comments: '', createdAt: new Date(), updatedAt: new Date(), submittedAt: { toMillis: () => 500 } },
];

describe('useDashboard', () => {
    beforeEach(() => {
        mockUseAuth.mockReturnValue({ user: { uid: 'test-user' }, loading: false, signOut: vi.fn() });
        mockUseRouter.mockReturnValue({ push: mockPush });
        mockOnSnapshot.mockImplementation((q, callback) => {
            callback({
                forEach: (cb: (doc: any) => void) => mockCandidates.forEach(c => cb({ id: c.id, data: () => c }))
            });
            return vi.fn(); // unsubscribe
        });
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it('redirects to login if not authenticated', () => {
        mockUseAuth.mockReturnValue({ user: null, loading: false, signOut: vi.fn() });
        renderHook(() => useDashboard());
        expect(mockPush).toHaveBeenCalledWith('/admin-dashboard-secret/login');
    });

    it('fetches and sets candidates on mount', () => {
        const { result } = renderHook(() => useDashboard());
        expect(result.current.loadingCandidates).toBe(false);
        expect(result.current.candidates.length).toBe(3);
        expect(result.current.candidates[0].id).toBe('2'); // Sorted by submittedAt
    });

    it('filters candidates based on status', () => {
        const { result } = renderHook(() => useDashboard());
        act(() => {
            result.current.setActiveTab('approved');
        });
        act(() => {
            result.current.setFilterStatus('approved');
        });
        expect(result.current.filteredCandidates.length).toBe(1);
        expect(result.current.filteredCandidates[0].id).toBe('2');
    });

    it('filters candidates based on name', () => {
        const { result } = renderHook(() => useDashboard());
        act(() => {
            result.current.setFilterName('John');
        });
        expect(result.current.filteredCandidates.length).toBe(1);
        expect(result.current.filteredCandidates[0].id).toBe('1');
    });

    it('clears all filters', () => {
        const { result } = renderHook(() => useDashboard());
        act(() => {
            result.current.setFilterName('John');
            result.current.setFilterStatus('submitted');
        });
        expect(result.current.filteredCandidates.length).toBe(1);
        act(() => {
            result.current.clearAllFilters();
        });
        // After clearing, it should go back to the default tab filter ('main')
        expect(result.current.filteredCandidates.length).toBe(1);
        expect(result.current.filteredCandidates[0].status).toBe('submitted');
    });

    it('calculates interview events correctly', () => {
        const { result } = renderHook(() => useDashboard());
        expect(result.current.allInterviewEvents.length).toBe(2);
        // Alice's interview is completed (July 20)
        expect(result.current.allInterviewEvents.find(e => e.resource.id === '2')?.isCompleted).toBe(true);
        // John's interview is upcoming (Aug 1)
        expect(result.current.allInterviewEvents.find(e => e.resource.id === '1')?.isCompleted).toBe(false);
    });

    it('filters interview events', () => {
        const { result } = renderHook(() => useDashboard());
        act(() => {
            result.current.setCalendarFilter('upcoming');
        });
        expect(result.current.filteredInterviewEvents.length).toBe(1);
        expect(result.current.filteredInterviewEvents[0].resource.id).toBe('1');

        act(() => {
            result.current.setCalendarFilter('completed');
        });
        expect(result.current.filteredInterviewEvents.length).toBe(1);
        expect(result.current.filteredInterviewEvents[0].resource.id).toBe('2');
    });

    it('manages modal state', () => {
        const { result } = renderHook(() => useDashboard());
        expect(result.current.isProfileModalOpen).toBe(false);
        act(() => {
            result.current.openProfileModal(mockCandidates[0]);
        });
        expect(result.current.isProfileModalOpen).toBe(true);
        expect(result.current.selectedCandidate?.id).toBe('1');
        act(() => {
            result.current.closeProfileModal();
        });
        expect(result.current.isProfileModalOpen).toBe(false);
    });

    it('shows and hides toast messages', () => {
        const { result } = renderHook(() => useDashboard());
        expect(result.current.toast.isVisible).toBe(false);
        act(() => {
            result.current.showToast('Test message', 'success');
        });
        expect(result.current.toast.isVisible).toBe(true);
        expect(result.current.toast.message).toBe('Test message');
        act(() => {
            vi.runAllTimers();
        });
        expect(result.current.toast.isVisible).toBe(false);
    });
});

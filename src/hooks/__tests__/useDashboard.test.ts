import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Candidate } from '@/types';

// Mock dependencies BEFORE importing anything that uses them
const mockOnSnapshot = vi.fn();

vi.mock('@/hooks/useAuth');
vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  onSnapshot: mockOnSnapshot,
}));
vi.mock('next/navigation');
vi.mock('@/lib/dashboardUtils');

// Now import the hooks and mocked functions
import { useDashboard } from '../useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const mockUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;
const mockUseRouter = useRouter as unknown as ReturnType<typeof vi.fn>;
const mockPush = vi.fn();

const mockCandidates: Partial<Candidate>[] = [
  {
    id: '1',
    fullName: 'John Doe',
    status: 'submitted',
    city: 'New York',
    country: 'USA',
    nationality: 'American',
    jobTitleText: 'Frontend Developer',
    jobCategory: 'Engineering',
    dateOfBirth: '1990-01-01',
    specialty: 'React',
    interviewDate: { toDate: () => new Date('2025-08-01T10:00:00Z') } as any,
    duration: 60,
    email: '',
    score: 0,
    scoreAnalysis: '',
    calendarEventId: '',
    meetLink: '',
    submittedAt: { toMillis: () => 1000 } as any,
    websites: [],
    cvUrl: '',
    passportUrl: '',
  },
  {
    id: '2',
    fullName: 'Alice Smith',
    status: 'approved',
    city: 'London',
    country: 'UK',
    nationality: 'British',
    jobTitleText: 'Backend Developer',
    jobCategory: 'Engineering',
    dateOfBirth: '1995-05-05',
    specialty: 'Node.js',
    interviewDate: { toDate: () => new Date('2025-07-20T14:00:00Z') } as any,
    duration: 30,
    email: '',
    score: 0,
    scoreAnalysis: '',
    calendarEventId: '',
    meetLink: '',
    submittedAt: { toMillis: () => 2000 } as any,
    websites: [],
    cvUrl: '',
    passportUrl: '',
  },
  {
    id: '3',
    fullName: 'Bob Johnson',
    status: 'rejected',
    city: 'New York',
    country: 'USA',
    nationality: 'American',
    jobTitleText: 'UI/UX Designer',
    jobCategory: 'Design',
    dateOfBirth: '1988-03-15',
    specialty: 'Figma',
    interviewDate: null,
    email: '',
    score: 0,
    scoreAnalysis: '',
    calendarEventId: '',
    meetLink: '',
    duration: 0,
    submittedAt: { toMillis: () => 500 } as any,
    websites: [],
    cvUrl: '',
    passportUrl: '',
  },
];

describe('useDashboard', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: { uid: 'test-user' }, loading: false, signOut: vi.fn() });
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockOnSnapshot.mockImplementation((q: any, callback: any) => {
      callback({
        forEach: (cb: (doc: any) => void) =>
          mockCandidates.forEach((c) => cb({ id: c.id, data: () => c })),
      });
      return vi.fn(); // unsubscribe
    });
    // Set system time to July 25, 2025 (between Alice's July 20 and John's Aug 1 interviews)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-07-25T12:00:00Z'));
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
    expect(result.current.allInterviewEvents.find((e) => e.resource.id === '2')?.isCompleted).toBe(
      true
    );
    // John's interview is upcoming (Aug 1)
    expect(result.current.allInterviewEvents.find((e) => e.resource.id === '1')?.isCompleted).toBe(
      false
    );
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

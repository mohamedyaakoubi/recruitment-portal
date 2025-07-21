import { renderHook, act } from '@testing-library/react';
import { useCandidateDashboard } from '../useCandidateDashboard';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockPush = jest.fn();

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useCandidateDashboard', () => {
    beforeEach(() => {
        mockUseRouter.mockReturnValue({
            push: mockPush,
        });
        mockFetch.mockClear();
        mockPush.mockClear();
    });

  it('should redirect to home if email is not in URL params', () => {
    renderHook(() => useCandidateDashboard());
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should fetch applications when email is in URL params', async () => {
    const mockApplications: Candidate[] = [
      { id: '1', email: 'test@example.com', status: 'Pending', score: 0, fullName: '', phone: '', availability: [], city: '', country: '', linkedin: '', github: '', resume: '', coverLetter: '', jobTitle: '', jobCategory: '', yearsOfExperience: 0, skills: [], referral: '', source: '', startDate: '', comments: '', createdAt: new Date(), updatedAt: new Date() },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ applications: mockApplications }),
    });

    let result: any;
    await act(async () => {
        const url = new URL(window.location.href);
        url.searchParams.set('email', 'test@example.com');
        window.history.pushState({}, '', url.toString());
        const { result: r } = renderHook(() => useCandidateDashboard());
        result = r;
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.applications).toEqual(mockApplications);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to load applications';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    let result: any;
    await act(async () => {
        const url = new URL(window.location.href);
        url.searchParams.set('email', 'test@example.com');
        window.history.pushState({}, '', url.toString());
        const { result: r } = renderHook(() => useCandidateDashboard());
        result = r;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.applications).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handleNewApplication should redirect to candidate form with email', () => {
    const { result } = renderHook(() => useCandidateDashboard());

    act(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('email', 'test@example.com');
        window.history.pushState({}, '', url.toString());
    });

    act(() => {
      result.current.handleNewApplication();
    });

    expect(mockPush).toHaveBeenCalledWith('/candidate-form?email=test%40example.com');
  });

  describe('formatDate', () => {
    it('should return "N/A" for null or undefined timestamp', () => {
      const { result } = renderHook(() => useCandidateDashboard());
      expect(result.current.formatDate(null)).toBe('N/A');
      expect(result.current.formatDate(undefined)).toBe('N/A');
    });

    it('should format a Date object', () => {
      const { result } = renderHook(() => useCandidateDashboard());
      const date = new Date('2023-10-27T10:00:00Z');
      // The output of toLocaleDateString can vary based on the test environment's timezone.
      // This test will be more stable if we don't assert the exact string.
      // Instead, we can check if it returns a non-empty string that is not 'N/A'.
      const formattedDate = result.current.formatDate(date);
      expect(formattedDate).not.toBe('N/A');
      expect(formattedDate).toContain('2023');
    });

    it('should format a string date', () => {
        const { result } = renderHook(() => useCandidateDashboard());
        const dateString = '2023-10-27T10:00:00Z';
        const formattedDate = result.current.formatDate(dateString);
        expect(formattedDate).not.toBe('N/A');
        expect(formattedDate).toContain('2023');
      });
  
      it('should format a Firestore timestamp-like object', () => {
        const { result } = renderHook(() => useCandidateDashboard());
        const timestamp = {
          toDate: () => new Date('2023-10-27T10:00:00Z'),
        };
        const formattedDate = result.current.formatDate(timestamp);
        expect(formattedDate).not.toBe('N/A');
        expect(formattedDate).toContain('2023');
      });

    it('should return "N/A" for an invalid date', () => {
      const { result } = renderHook(() => useCandidateDashboard());
      expect(result.current.formatDate('invalid-date')).toBe('N/A');
    });
  });
});
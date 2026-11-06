import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCandidateDashboard } from '../useCandidateDashboard';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const mockUseRouter = useRouter as vi.Mock;
const mockPush = vi.fn();

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useCandidateDashboard', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
    mockFetch.mockClear();
    mockPush.mockClear();
  });

  it('should redirect to home if email is not in URL params', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      renderHook(() => useCandidateDashboard());
    });
    expect(mockPush).toHaveBeenCalledWith('/');
    consoleErrorSpy.mockRestore();
  });

  it('should fetch applications when email is in URL params', async () => {
    const mockApplications: Candidate[] = [
      {
        id: '1',
        email: 'test@example.com',
        status: 'Pending',
        score: 0,
        fullName: '',
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
        updatedAt: new Date(),
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ applications: mockApplications }),
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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
    consoleErrorSpy.mockRestore();
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to load applications';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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
    consoleErrorSpy.mockRestore();
  });

  it('handleNewApplication should redirect to candidate form with email', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let result: any;
    await act(async () => {
      const { result: r } = renderHook(() => useCandidateDashboard());
      result = r;
    });

    act(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('email', 'test@example.com');
      window.history.pushState({}, '', url.toString());
    });

    act(() => {
      result.current.handleNewApplication();
    });

    expect(mockPush).toHaveBeenCalledWith('/candidate-form?email=test%40example.com');
    consoleErrorSpy.mockRestore();
  });

  describe('formatDate', () => {
    it('should return "N/A" for null or undefined timestamp', async () => {
      let result: any;
      await act(async () => {
        const { result: r } = renderHook(() => useCandidateDashboard());
        result = r;
      });
      expect(result.current.formatDate(null)).toBe('N/A');
      expect(result.current.formatDate(undefined)).toBe('N/A');
    });

    it('should format a Date object', async () => {
      let result: any;
      await act(async () => {
        const { result: r } = renderHook(() => useCandidateDashboard());
        result = r;
      });
      const date = new Date('2023-10-27T10:00:00Z');
      // The output of toLocaleDateString can vary based on the test environment's timezone.
      // This test will be more stable if we don't assert the exact string.
      // Instead, we can check if it returns a non-empty string that is not 'N/A'.
      const formattedDate = result.current.formatDate(date);
      expect(formattedDate).not.toBe('N/A');
      expect(formattedDate).toContain('2023');
    });

    it('should format a string date', async () => {
      let result: any;
      await act(async () => {
        const { result: r } = renderHook(() => useCandidateDashboard());
        result = r;
      });
      const dateString = '2023-10-27T10:00:00Z';
      const formattedDate = result.current.formatDate(dateString);
      expect(formattedDate).not.toBe('N/A');
      expect(formattedDate).toContain('2023');
    });

    it('should format a Firestore timestamp-like object', async () => {
      let result: any;
      await act(async () => {
        const { result: r } = renderHook(() => useCandidateDashboard());
        result = r;
      });
      const timestamp = {
        toDate: () => new Date('2023-10-27T10:00:00Z'),
      };
      const formattedDate = result.current.formatDate(timestamp);
      expect(formattedDate).not.toBe('N/A');
      expect(formattedDate).toContain('2023');
    });

    it('should return "N/A" for an invalid date', async () => {
      let result: any;
      await act(async () => {
        const { result: r } = renderHook(() => useCandidateDashboard());
        result = r;
      });
      expect(result.current.formatDate('invalid-date')).toBe('N/A');
    });
  });
});

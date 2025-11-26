import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Candidate } from '@/types';

// Mock Firebase BEFORE importing anything that uses it
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockOnSnapshot = vi.fn();

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  query: mockQuery,
  onSnapshot: mockOnSnapshot,
}));

// Now import the hook
import { useCandidates } from '../useCandidates';

describe('useCandidates', () => {
  it('should not fetch candidates if user is null', () => {
    const { result } = renderHook(() => useCandidates(null));
    expect(result.current.candidates).toEqual([]);
    expect(result.current.loadingCandidates).toBe(false);
    expect(mockCollection).not.toHaveBeenCalled();
  });

  it('should fetch and set candidates if user is provided', async () => {
    const mockUser = { uid: 'test-user' };
    const mockCandidates: Partial<Candidate>[] = [
      { id: '1', submittedAt: { toMillis: () => 2000 } as any },
      { id: '2', submittedAt: { toMillis: () => 1000 } as any },
    ];

    let onSnapshotCallback: (snapshot: any) => void;
    mockOnSnapshot.mockImplementation((q: any, callback: (snapshot: any) => void) => {
      onSnapshotCallback = callback;
      return vi.fn(); // Unsubscribe function
    });

    const { result } = renderHook(() => useCandidates(mockUser));

    expect(result.current.loadingCandidates).toBe(true);

    await act(async () => {
      onSnapshotCallback({
        forEach: (cb: (doc: any) => void) => {
          mockCandidates.forEach((candidate) =>
            cb({
              id: candidate.id,
              data: () => candidate,
            })
          );
        },
      });
    });

    expect(result.current.loadingCandidates).toBe(false);
    expect(result.current.candidates.length).toBe(2);
    // Check for correct sorting
    expect(result.current.candidates[0].id).toBe('1');
    expect(result.current.candidates[1].id).toBe('2');
  });

  it('should handle fetch errors', async () => {
    const mockUser = { uid: 'test-user' };
    const errorMessage = 'Failed to fetch';

    let onErrorCallback: (error: Error) => void;
    mockOnSnapshot.mockImplementation(
      (q: any, successCb: (snapshot: any) => void, errorCb: (error: Error) => void) => {
        onErrorCallback = errorCb;
        return vi.fn();
      }
    );

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useCandidates(mockUser));

    await act(async () => {
      onErrorCallback(new Error(errorMessage));
    });

    expect(result.current.loadingCandidates).toBe(false);
    expect(result.current.candidates).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching candidates: ',
      new Error(errorMessage)
    );
    consoleErrorSpy.mockRestore();
  });

  it('should unsubscribe on unmount', () => {
    const mockUser = { uid: 'test-user' };
    const unsubscribe = vi.fn();
    mockOnSnapshot.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useCandidates(mockUser));

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

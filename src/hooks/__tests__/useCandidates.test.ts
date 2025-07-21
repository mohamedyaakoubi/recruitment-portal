
import { renderHook, act } from '@testing-library/react';
import { useCandidates } from '../useCandidates';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Candidate } from '@/types';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: jest.fn(),
}));
jest.mock('firebase/firestore');

const mockOnSnapshot = onSnapshot as jest.Mock;

describe('useCandidates', () => {
  it('should not fetch candidates if user is null', () => {
    const { result } = renderHook(() => useCandidates(null));
    expect(result.current.candidates).toEqual([]);
    expect(result.current.loadingCandidates).toBe(false);
    expect(collection).not.toHaveBeenCalled();
  });

  it('should fetch and set candidates if user is provided', async () => {
    const mockUser = { uid: 'test-user' };
    const mockCandidates: Partial<Candidate>[] = [
      { id: '1', submittedAt: { toMillis: () => 2000 } },
      { id: '2', submittedAt: { toMillis: () => 1000 } },
    ];

    let onSnapshotCallback: (snapshot: any) => void;
    mockOnSnapshot.mockImplementation((q, callback) => {
      onSnapshotCallback = callback;
      return jest.fn(); // Unsubscribe function
    });

    const { result } = renderHook(() => useCandidates(mockUser));

    expect(result.current.loadingCandidates).toBe(true);

    await act(async () => {
      onSnapshotCallback({
        forEach: (cb: (doc: any) => void) => {
          mockCandidates.forEach(candidate => cb({
            id: candidate.id,
            data: () => candidate,
          }));
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
    mockOnSnapshot.mockImplementation((q, successCb, errorCb) => {
      onErrorCallback = errorCb;
      return jest.fn();
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useCandidates(mockUser));

    await act(async () => {
      onErrorCallback(new Error(errorMessage));
    });

    expect(result.current.loadingCandidates).toBe(false);
    expect(result.current.candidates).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching candidates: ', new Error(errorMessage));
    consoleErrorSpy.mockRestore();
  });

  it('should unsubscribe on unmount', () => {
    const mockUser = { uid: 'test-user' };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useCandidates(mockUser));

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

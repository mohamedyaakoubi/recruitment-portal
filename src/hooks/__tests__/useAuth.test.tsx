import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../useAuth';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { User } from 'firebase/auth';

jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the initial state', () => {
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update user when auth state changes', () => {
    const mockUser = { uid: '123', email: 'test@example.com' } as User;
    
    act(() => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('should sign in a user successfully', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'test@example.com',
      'password'
    );
    expect(result.current.error).toBeNull();
  });

  it('should handle sign in failure', async () => {
    const error = new Error('Invalid credentials');
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'wrong-password');
    });

    expect(result.current.error).toBe(error.message);
  });

  it('should sign out a user successfully', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(signOut).toHaveBeenCalledWith(auth);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle sign out failure', async () => {
    const error = new Error('Sign out failed');
    (signOut as jest.Mock).mockRejectedValue(error);
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.error).toBe(error.message);
  });
});

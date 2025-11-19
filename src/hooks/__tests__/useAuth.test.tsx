import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '../../hooks/useAuth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Mock Firebase modules
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  getAuth: vi.fn(),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    // Mock onAuthStateChanged to not immediately resolve
    (onAuthStateChanged as any).mockImplementation(() => () => { });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('should update user state when auth changes', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };

    // Mock onAuthStateChanged to immediately call callback with user
    (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback(mockUser);
      return () => { };
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle sign in', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    (signInWithEmailAndPassword as any).mockResolvedValue({ user: mockUser });

    // Setup initial state
    (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback(null); // Start as logged out
      return () => { };
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
  });

  it('should handle sign out', async () => {
    (signOut as any).mockResolvedValue(undefined);

    // Setup initial state
    (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback({ uid: '123' }); // Start as logged in
      return () => { };
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(signOut).toHaveBeenCalledWith(auth);
    expect(result.current.user).toBeNull();
  });
});

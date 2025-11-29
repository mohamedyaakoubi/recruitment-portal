'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode, useRef } from 'react';
// import { useRouter } from 'next/navigation'; // Removed as it's unused here
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { AuthContextType } from '@/types';
import logger from '@/lib/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Client-side rate limiting for login attempts
const LOGIN_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 60 * 1000, // 1 minute
};

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  blockedUntil: number | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loginAttemptsRef = useRef<LoginAttempt>({
    count: 0,
    firstAttempt: 0,
    blockedUntil: null,
  });
  // const router = useRouter(); // Removed as it's unused here

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      logger.info('useAuth: onAuthStateChanged', { user: user?.email, uid: user?.uid });
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Check if login is rate limited
   */
  const checkLoginRateLimit = (): { allowed: boolean; retryAfter?: number } => {
    const now = Date.now();
    const attempts = loginAttemptsRef.current;

    // Check if currently blocked
    if (attempts.blockedUntil && now < attempts.blockedUntil) {
      const retryAfter = Math.ceil((attempts.blockedUntil - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Reset if window has passed
    if (now - attempts.firstAttempt > LOGIN_RATE_LIMIT.windowMs) {
      loginAttemptsRef.current = {
        count: 0,
        firstAttempt: 0,
        blockedUntil: null,
      };
    }

    return { allowed: true };
  };

  /**
   * Record a login attempt
   */
  const recordLoginAttempt = (success: boolean): void => {
    const now = Date.now();
    const attempts = loginAttemptsRef.current;

    // Reset on successful login
    if (success) {
      loginAttemptsRef.current = {
        count: 0,
        firstAttempt: 0,
        blockedUntil: null,
      };
      return;
    }

    // First attempt in window
    if (attempts.count === 0) {
      loginAttemptsRef.current = {
        count: 1,
        firstAttempt: now,
        blockedUntil: null,
      };
      return;
    }

    // Increment count
    attempts.count++;

    // Block if limit reached
    if (attempts.count >= LOGIN_RATE_LIMIT.maxAttempts) {
      attempts.blockedUntil = now + LOGIN_RATE_LIMIT.windowMs;
      logger.warn('Login rate limit reached', {
        attempts: attempts.count,
        blockedUntil: new Date(attempts.blockedUntil).toISOString(),
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    // Check rate limit before attempting Firebase auth
    const rateCheck = checkLoginRateLimit();
    if (!rateCheck.allowed) {
      setError(`Too many login attempts. Please try again in ${rateCheck.retryAfter} seconds.`);
      setLoading(false);
      logger.warn('Login blocked by client-side rate limit', {
        email,
        retryAfter: rateCheck.retryAfter,
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      recordLoginAttempt(true);
      // Redirect is handled by the component using the hook based on user state
    } catch (err) {
      recordLoginAttempt(false);
      // Type assertion for error object
      if (err instanceof Error) {
        // Make Firebase error messages more user-friendly
        const message = err.message;
        if (message.includes('auth/too-many-requests')) {
          setError('Too many login attempts. Please try again later.');
        } else if (
          message.includes('auth/invalid-credential') ||
          message.includes('auth/wrong-password') ||
          message.includes('auth/user-not-found')
        ) {
          // Don't log expected auth failures as errors - they're user mistakes, not system errors
          logger.warn('Login failed - invalid credentials', { email });
          setError('Invalid email or password.');
        } else {
          // Log unexpected errors
          logger.error('Firebase Sign In Error', err, { email });
          setError(message || 'Failed to sign in');
        }
      } else {
        logger.error('Firebase Sign In Error', err, { email });
        setError('Failed to sign in: An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      // Redirect is handled where signOut is called, e.g., in the dashboard component
    } catch (err) {
      logger.error('Firebase Sign Out Error', err);
      // Type assertion for error object
      if (err instanceof Error) {
        setError(err.message || 'Failed to sign out');
      } else {
        setError('Failed to sign out: An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

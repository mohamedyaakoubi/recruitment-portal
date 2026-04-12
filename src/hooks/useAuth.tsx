'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithCustomToken,
  User,
} from 'firebase/auth';
import { AuthContextType, OtpStep } from '@/types';
import logger from '@/lib/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState<OtpStep>('email');
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      logger.info('useAuth: onAuthStateChanged', {
        user: firebaseUser?.email,
        uid: firebaseUser?.uid,
      });
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const requestOtp = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin-auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = (await response.json()) as { success: boolean; error?: string };

      if (!response.ok) {
        const message = json.error ?? 'Failed to send verification code.';
        setError(message);
        logger.warn('OTP request failed', { status: response.status });
        return;
      }

      setPendingEmail(email);
      setOtpStep('otp');
      logger.info('OTP requested successfully');
    } catch (err) {
      logger.error('OTP request network error', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin-auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const json = (await response.json()) as {
        success: boolean;
        data?: { customToken: string };
        error?: string;
      };

      if (!response.ok) {
        const message = json.error ?? 'Invalid or expired verification code.';
        setError(message);
        logger.warn('OTP verification failed', { status: response.status });
        return;
      }

      const customToken = json.data?.customToken;
      if (!customToken) {
        setError('Authentication failed. Please try again.');
        return;
      }

      await signInWithCustomToken(auth, customToken);
      setOtpStep('email');
      setPendingEmail('');
      logger.info('Admin authenticated via OTP');
    } catch (err) {
      logger.error('OTP verification error', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setOtpStep('email');
      setPendingEmail('');
    } catch (err) {
      logger.error('Firebase Sign Out Error', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to sign out');
      } else {
        setError('Failed to sign out: An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    otpStep,
    pendingEmail,
    requestOtp,
    verifyOtp,
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

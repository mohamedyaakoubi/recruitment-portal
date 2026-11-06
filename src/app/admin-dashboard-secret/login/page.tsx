'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const { user, requestOtp, verifyOtp, loading, error, otpStep, pendingEmail } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/admin-dashboard-secret');
    }
  }, [user, router]);

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    await requestOtp(email);
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    await verifyOtp(pendingEmail, otp);
  };

  if (user) {
    return <p>Redirecting...</p>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-200">
          Admin Login
        </h2>

        {otpStep === 'email' ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send verification code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A 6-digit verification code was sent to{' '}
              <strong className="text-gray-900 dark:text-gray-200">{pendingEmail}</strong>. Enter it
              below to sign in.
            </p>

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Verification code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                pattern="\d{6}"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-center font-mono text-2xl tracking-widest text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                placeholder="000000"
                disabled={loading}
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & sign in'}
            </button>

            <button
              type="button"
              onClick={() => requestOtp(pendingEmail)}
              disabled={loading}
              className="w-full text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50 dark:text-indigo-400"
            >
              Resend code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ThemeSwitcher } from './components/ui/ThemeSwitcher';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import logger from '@/lib/logger';

// Helper component for social media icons in the footer
const SocialIcon = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-slate-400 transition-colors hover:text-white"
  >
    {children}
  </a>
);

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show expiry / error messages from magic link redirects
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError === 'link_expired') {
      setError('Your sign-in link has expired or was already used. Please request a new one.');
    } else if (urlError === 'session_expired') {
      setError('Your session has expired. Please sign in again.');
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Determine destination: existing candidates go to choices, new ones to form
      const checkResponse = await fetch('/api/check-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const checkResult = await checkResponse.json();
      if (!checkResponse.ok) {
        throw new Error(checkResult.error || 'Failed to check candidate status');
      }
      const checkData = checkResult.data || checkResult;
      const dest = checkData.exists && checkData.count > 0 ? 'choices' : 'form';

      // Send magic link — always returns success (prevents enumeration)
      const mlResponse = await fetch('/api/candidate-auth/request-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, dest }),
      });
      const mlResult = await mlResponse.json();
      if (!mlResponse.ok) {
        throw new Error(mlResult.error || 'Failed to send sign-in link');
      }

      setLinkSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      if (msg.includes('Too many requests') || msg.includes('rate limit')) {
        setError("You're requesting too quickly. Please wait a moment and try again.");
      } else {
        logger.error('Magic link request error', err);
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans dark:bg-gray-900">
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white shadow-sm dark:bg-gray-800">
        <div className="bg-[#003A70] py-1.5 text-xs text-white">
          <div className="mx-auto flex max-w-screen-xl items-center justify-center px-4 sm:px-6 md:justify-between">
            <div className="flex items-center">
              <span className="mr-2 text-base text-yellow-400">!</span>
              <span>Découvrez les dernières opportunités!</span>
            </div>
            <div className="hidden items-center space-x-6 md:flex">
              {process.env.NEXT_PUBLIC_CONTACT_PHONE && (
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE.replace(/\s/g, '')}`}
                  className="flex items-center space-x-2 transition-colors hover:text-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>{process.env.NEXT_PUBLIC_CONTACT_PHONE}</span>
                </a>
              )}
              {process.env.NEXT_PUBLIC_SUPPORT_EMAIL && (
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
                  className="flex items-center space-x-2 transition-colors hover:text-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</span>
                </a>
              )}
            </div>
          </div>
        </div>
        <nav className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            {mounted ? (
              <Image
                src={theme === 'dark' ? '/logo-skills-white.png' : '/logo-skills.png'}
                alt={process.env.NEXT_PUBLIC_COMPANY_NAME || 'Career Portal'}
                width={180}
                height={45}
                priority
              />
            ) : (
              <div style={{ width: 180, height: 45 }} />
            )}
            <ThemeSwitcher />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main
        id="main-content"
        className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6"
        tabIndex={-1}
      >
        <div className="w-full max-w-2xl space-y-8 text-center">
          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold leading-tight text-[#003A70] dark:text-blue-400 sm:text-6xl">
              Your Career Journey
              <span className="mt-2 block text-3xl font-semibold text-slate-600 dark:text-slate-300 sm:text-5xl">
                Starts Here
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">
              Connect with international opportunities and take the next step in your professional
              journey. Join thousands of professionals who have found their dream careers through
              our platform.
            </p>
          </div>

          {/* Email Form */}
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none sm:p-10">
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold text-[#003A70] dark:text-blue-400 sm:text-3xl">
                  Get Started
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Enter your email to begin your application or access your dashboard
                </p>
              </div>

              <form
                onSubmit={handleEmailSubmit}
                className="space-y-4"
                aria-label="Email submission form"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-3 block text-sm font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-6 py-4 text-lg shadow-sm transition-colors focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="your.email@example.com"
                    disabled={isLoading || linkSent}
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-900/20">
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                  </div>
                )}

                {linkSent ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-500/30 dark:bg-green-900/20">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800/50">
                      <svg
                        className="h-6 w-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="font-semibold text-green-800 dark:text-green-300">
                      Check your inbox
                    </p>
                    <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                      We sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLinkSent(false);
                        setEmail('');
                        setError(null);
                      }}
                      className="mt-4 text-sm text-green-700 underline hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                    >
                      Use a different email
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full transform rounded-xl bg-[#003A70] px-8 py-4 text-lg font-bold tracking-wide text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-[#002B54] focus:outline-none focus:ring-2 focus:ring-[#003A70] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Sending link...</span>
                      </div>
                    ) : (
                      'Send sign-in link'
                    )}
                  </button>
                )}
              </form>

              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We&apos;ll send a secure one-time link to your inbox. No password needed.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#003A70]/10 dark:bg-blue-900/50">
                <svg
                  className="h-8 w-8 text-[#003A70] dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                Global Opportunities
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Access international job opportunities across various industries
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#003A70]/10 dark:bg-blue-900/50">
                <svg
                  className="h-8 w-8 text-[#003A70] dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Verified Process</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Secure and verified application process with real email validation
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#003A70]/10 dark:bg-blue-900/50">
                <svg
                  className="h-8 w-8 text-[#003A70] dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Fast Track</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Streamlined application process to get you started quickly
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#003A70] text-white">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div>
              <Image
                src="/logo-skills-white.png"
                alt={process.env.NEXT_PUBLIC_COMPANY_NAME || 'Career Portal'}
                width={180}
                height={45}
                className="mb-4"
              />
              <p className="text-sm text-slate-300">
                Connecting talented professionals with international opportunities.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Contact
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {process.env.NEXT_PUBLIC_SUPPORT_EMAIL && (
                  <p className="flex items-center">
                    <span className="mr-2 opacity-80">📧</span>{' '}
                    {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
                  </p>
                )}
                {process.env.NEXT_PUBLIC_CONTACT_PHONE && (
                  <p className="flex items-center">
                    <span className="mr-2 opacity-80">📞</span>{' '}
                    {process.env.NEXT_PUBLIC_CONTACT_PHONE}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Suivez-nous
              </h3>
              <div className="mt-4 flex space-x-5">
                <SocialIcon href="https://www.linkedin.com/company/international-skills-labor-company/">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      clipRule="evenodd"
                    />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://www.facebook.com/profile.php?id=61571369068485">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://www.instagram.com/">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z"
                      clipRule="evenodd"
                    />
                    <path d="M16.95 6.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6z" />
                  </svg>
                </SocialIcon>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-700 pt-8 text-center">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()}{' '}
              {process.env.NEXT_PUBLIC_COMPANY_NAME || 'The Organization'}. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/candidate-choices/Header';
import Footer from '../components/candidate-choices/Footer';

export default function CandidateChoices() {
  const [candidateEmail, setCandidateEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
      setCandidateEmail(email);
    } else {
      router.push('/');
    }
  }, [router]);

  const handleNewApplication = () => {
    setIsLoading(true);
    router.push(`/candidate-form?email=${encodeURIComponent(candidateEmail)}`);
  };

  const handleViewApplications = () => {
    setIsLoading(true);
    router.push(`/candidate-dashboard?email=${encodeURIComponent(candidateEmail)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-4xl space-y-8 text-center">
          {/* Welcome Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold leading-tight text-[#003A70] dark:text-blue-400 sm:text-6xl">
              Welcome Back!
              <span className="mt-2 block text-2xl font-semibold text-slate-600 dark:text-slate-300 sm:text-3xl">
                What would you like to do?
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">
              We found existing applications for <strong>{candidateEmail}</strong>. Choose an option
              below to continue.
            </p>
          </div>

          {/* Choice Cards */}
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* New Application Card */}
            <div className="hover:shadow-3xl rounded-2xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200 transition-shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
              <div className="space-y-6">
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#003A70]/10 dark:bg-blue-900/50">
                    <svg
                      className="h-10 w-10 text-[#003A70] dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#003A70] dark:text-blue-400">
                    New Application
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Submit a fresh application for a new job opportunity. Fill out the complete
                    application form with your latest information.
                  </p>
                </div>

                <button
                  onClick={handleNewApplication}
                  disabled={isLoading}
                  className="w-full transform rounded-xl bg-[#003A70] px-8 py-4 text-lg font-bold tracking-wide text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-[#002B54] focus:outline-none focus:ring-2 focus:ring-[#003A70] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Start New Application'
                  )}
                </button>
              </div>
            </div>

            {/* View Applications Card */}
            <div className="hover:shadow-3xl rounded-2xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200 transition-shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
              <div className="space-y-6">
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                    <svg
                      className="h-10 w-10 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Review Applications
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    View and manage your existing applications. Check application status, interview
                    schedules, and download documents.
                  </p>
                </div>

                <button
                  onClick={handleViewApplications}
                  disabled={isLoading}
                  className="w-full transform rounded-xl bg-green-600 px-8 py-4 text-lg font-bold tracking-wide text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'View My Applications'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-500/30 dark:bg-blue-900/20">
            <div className="flex items-start space-x-3">
              <svg
                className="mt-0.5 h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="mb-1 font-semibold text-blue-800 dark:text-blue-300">Need Help?</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300/80">
                  If you have questions about your applications or need assistance, please contact
                  us at{' '}
                  <a
                    href="mailto:wassim@internationalskills.fi"
                    className="underline hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    wassim@internationalskills.fi
                  </a>{' '}
                  or call{' '}
                  <a
                    href="tel:+358452644966"
                    className="underline hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    +358 452644966
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

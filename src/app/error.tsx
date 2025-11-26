'use client';

import { useEffect } from 'react';
import logger from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Application error occurred', error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Something went wrong!
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-[#003A70] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#002B54]"
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}

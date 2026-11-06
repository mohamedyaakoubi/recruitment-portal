'use client';

import React from 'react';

const HelpSection = () => {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-500/30 dark:bg-blue-900/20">
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
          <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-300">Need Help?</h3>
          <p className="mb-3 text-sm text-blue-700 dark:text-blue-300/80">
            If you have questions, please contact us:
          </p>
          <div className="space-y-2 text-sm">
            {process.env.NEXT_PUBLIC_SUPPORT_EMAIL && (
              <p className="text-blue-700 dark:text-blue-300/80">
                📧 Email:{' '}
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
                  className="underline hover:text-blue-800 dark:hover:text-blue-200"
                >
                  {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
                </a>
              </p>
            )}
            {process.env.NEXT_PUBLIC_CONTACT_PHONE && (
              <p className="text-blue-700 dark:text-blue-300/80">
                📞 Phone:{' '}
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE.replace(/\s/g, '')}`}
                  className="underline hover:text-blue-800 dark:hover:text-blue-200"
                >
                  {process.env.NEXT_PUBLIC_CONTACT_PHONE}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;

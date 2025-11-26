'use client';

import React from 'react';

const TopBar: React.FC = () => {
  return (
    <div className="bg-[#003A70] py-1.5 text-xs text-white">
      <div className="mx-auto flex max-w-screen-xl items-center justify-center px-4 sm:px-6 md:justify-between">
        <div className="flex items-center">
          <span className="mr-2 text-base text-yellow-400">⚠️</span>
          <span>Découvrez les dernières opportunités!</span>
        </div>
        <div className="hidden items-center space-x-6 md:flex">
          <a
            href="tel:+358452644966"
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
            <span>+358 452644966</span>
          </a>
          <a
            href="mailto:wassim@internationalskills.fi"
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
            <span>wassim@internationalskills.fi</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

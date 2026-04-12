'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import TopBar from '../common/TopBar';

const DashboardHeader = () => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm dark:bg-gray-800">
      <TopBar />
      <nav className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          <span className="text-xl font-bold text-[#003A70] dark:text-white">
            {process.env.NEXT_PUBLIC_COMPANY_NAME || 'Career Portal'}
          </span>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <button
              onClick={() => router.push('/')}
              className="font-medium text-[#003A70] hover:text-[#002B54] dark:text-gray-200 dark:hover:text-white"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default DashboardHeader;

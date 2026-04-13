'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import TopBar from '../common/TopBar';
import LogoutButton from '@/app/components/candidate-common/LogoutButton';

const DashboardHeader = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm dark:bg-gray-800">
      <TopBar />
      <nav className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          <span className="text-xl font-bold text-[#003A70] dark:text-white">
            {process.env.NEXT_PUBLIC_COMPANY_NAME || 'Career Portal'}
          </span>
          <div className="flex items-center gap-3">
            {email && (
              <Link
                href={`/candidate-choices?email=${encodeURIComponent(email)}`}
                className="text-sm font-medium text-[#003A70] hover:text-[#002B54] dark:text-gray-300 dark:hover:text-white"
              >
                ← My options
              </Link>
            )}
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default DashboardHeader;

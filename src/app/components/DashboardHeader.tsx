import React from 'react';
import { DashboardHeaderProps } from '@/types';
import { ThemeSwitcher } from './ui/ThemeSwitcher';
import TopBar from './common/TopBar';
import { useRouter } from 'next/navigation';

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userEmail,
  onManageJobsClick,
  onSignOut,
}) => {
  const _router = useRouter();

  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm dark:bg-gray-800">
      <TopBar />
      <nav className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          <span className="text-xl font-bold text-[#003A70] dark:text-white">
            {process.env.NEXT_PUBLIC_COMPANY_NAME || 'Career Portal'}
          </span>
          <div className="flex items-center gap-4">
            <div className="mr-2 hidden text-sm text-gray-600 dark:text-gray-300 md:block">
              Welcome back,{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{userEmail}</span>
            </div>
            <ThemeSwitcher />
            <button
              onClick={onManageJobsClick}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Manage Jobs
            </button>
            <button
              onClick={onSignOut}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:bg-red-900/50 dark:hover:text-red-400"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default DashboardHeader;

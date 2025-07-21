// src/app/components/DashboardHeader.tsx
import React from 'react';
import { DashboardHeaderProps } from '@/types';
import { ThemeSwitcher } from './ui/ThemeSwitcher';

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userEmail,
  onManageJobsClick,
  onSignOut
}) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, {userEmail}</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeSwitcher />
        <button 
          onClick={onManageJobsClick}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium transition-colors"
        >
          Manage Jobs
        </button>
        <button 
          onClick={onSignOut} 
          className="px-4 py-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;


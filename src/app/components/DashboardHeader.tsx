import React, { useState, useEffect } from 'react';
import { DashboardHeaderProps } from '@/types';
import { ThemeSwitcher } from './ui/ThemeSwitcher';
import { useTheme } from 'next-themes';
import TopBar from './common/TopBar'; // Corrected import path
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userEmail,
  onManageJobsClick,
  onSignOut
}) => {
    const router = useRouter();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
            <TopBar />
            <nav className="max-w-screen-xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between py-4">
                    {mounted ? (
                        <Image
                            src={theme === 'dark' ? "/logo-skills-white.png" : "/logo-skills.png"}
                            alt="International Skills Labor Company"
                            width={180}
                            height={45}
                            priority
                        />
                    ) : (
                        <div style={{ width: 180, height: 45 }} />
                    )}
                    <div className="flex items-center gap-4">
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
                </div>
            </nav>
        </header>
    );
};

export default DashboardHeader;
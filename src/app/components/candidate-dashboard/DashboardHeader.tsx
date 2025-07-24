"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { useTheme } from 'next-themes';
import TopBar from '../common/TopBar';

const DashboardHeader = () => {
    const router = useRouter();
    const { theme } = useTheme();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
            <TopBar />
            <nav className="max-w-screen-xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between py-4">
                    <Image
                        src={theme === 'dark' ? "/logo-skills-white.png" : "/logo-skills.png"}
                        alt="International Skills Labor Company"
                        width={180}
                        height={45}
                        priority
                    />
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <button
                            onClick={() => router.push('/')}
                            className="text-[#003A70] dark:text-gray-200 hover:text-[#002B54] dark:hover:text-white font-medium"
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

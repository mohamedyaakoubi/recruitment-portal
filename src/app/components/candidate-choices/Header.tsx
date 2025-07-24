"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from '@/app/components/ui/ThemeSwitcher';
import { useTheme } from 'next-themes';

const Header: React.FC = () => {
    const router = useRouter();
    const { theme } = useTheme();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
            <div className="bg-[#003A70] text-white text-xs py-1.5">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex justify-center md:justify-between items-center">
                    <div className="flex items-center">
                        <span className="text-yellow-400 mr-2 text-base">⚠️</span>
                        <span>Découvrez les dernières opportunités!</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-6">
                        <a href="tel:+358452644966" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span>+358 452644966</span>
                        </a>
                        <a href="mailto:wassim@internationalskills.fi" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span>wassim@internationalskills.fi</span>
                        </a>
                    </div>
                </div>
            </div>
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

export default Header;

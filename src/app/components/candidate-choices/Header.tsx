'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { ThemeSwitcher } from '@/app/components/ui/ThemeSwitcher';
import LogoutButton from '@/app/components/candidate-common/LogoutButton';

const Header: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm dark:bg-gray-800">
      <div className="bg-[#003A70] py-1.5 text-xs text-white">
        <div className="mx-auto flex max-w-screen-xl items-center justify-center px-4 sm:px-6 md:justify-between">
          <div className="flex items-center">
            <span className="mr-2 text-base text-yellow-400">⚠️</span>
            <span>Découvrez les dernières opportunités!</span>
          </div>
          <div className="hidden items-center space-x-6 md:flex">
            {process.env.NEXT_PUBLIC_CONTACT_PHONE && (
              <a
                href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE}`}
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
                <span>{process.env.NEXT_PUBLIC_CONTACT_PHONE}</span>
              </a>
            )}
            {process.env.NEXT_PUBLIC_SUPPORT_EMAIL && (
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
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
                <span>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</span>
              </a>
            )}
          </div>
        </div>
      </div>
      <nav className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          {mounted ? (
            <Image
              src={resolvedTheme === 'dark' ? '/logo-skills-white.png' : '/logo-skills.png'}
              alt={process.env.NEXT_PUBLIC_COMPANY_NAME || 'International Skills Labor Company'}
              width={180}
              height={45}
              priority
            />
          ) : (
            <div style={{ width: 180, height: 45 }} />
          )}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

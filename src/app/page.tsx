"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from './components/ui/ThemeSwitcher';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

// Helper component for social media icons in the footer
const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
    {children}
  </a>
);

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();

      // 🔥 STEP 1: Check database first (FREE - no API cost)
      console.log('Step 1: Checking database for existing candidate...');
      const checkResponse = await fetch('/api/check-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const checkResult = await checkResponse.json();
      
      if (!checkResponse.ok) {
        throw new Error(checkResult.error || 'Failed to check candidate status');
      }

      // If candidate exists in database, skip email verification
      if (checkResult.exists && checkResult.count > 0) {
        console.log('✅ Existing candidate found in database - redirecting to choices');
        router.push(`/candidate-choices?email=${encodeURIComponent(normalizedEmail)}`);
        return;
      }

      // 🔥 STEP 2: Only verify email if candidate doesn't exist (COSTS MONEY)
      console.log('Step 2: New email - verifying with external API...');
      const verifyResponse = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const verifyResult = await verifyResponse.json();
      
      if (!verifyResponse.ok) {
        throw new Error(verifyResult.error || 'Email verification failed');
      }

      if (!verifyResult.isValid) {
        setError('Please enter a valid email address that exists');
        return;
      }

      // 🔥 STEP 3: Email is valid and new - redirect to form
      console.log('✅ Email verified - redirecting to application form');
      router.push(`/candidate-form?email=${encodeURIComponent(normalizedEmail)}`);

    } catch (err) {
      console.error('Email submission error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
          <div className="bg-[#003A70] text-white text-xs py-1.5">
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex justify-center md:justify-between items-center">
                  <div className="flex items-center">
                      <span className="text-yellow-400 mr-2 text-base">!</span>
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
                  <ThemeSwitcher />
              </div>
          </nav>
      </header>
      
      {/* Hero Section */}
      <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#003A70] dark:text-blue-400 leading-tight">
              Your Career Journey 
              <span className="block text-3xl sm:text-5xl text-slate-600 dark:text-slate-300 font-semibold mt-2">
                Starts Here
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Connect with international opportunities and take the next step in your professional journey. 
              Join thousands of professionals who have found their dream careers through our platform.
            </p>
          </div>

          {/* Email Form */}
          <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-gray-700">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#003A70] dark:text-blue-400">Get Started</h2>
                <p className="text-slate-500 dark:text-slate-400">Enter your email to begin your application or access your dashboard</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 text-lg border border-slate-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="your.email@example.com"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-[#003A70] text-white font-bold text-lg tracking-wide rounded-xl shadow-lg hover:bg-[#002B54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003A70] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Checking...</span>
                    </div>
                  ) : (
                    'Continue'
                  )}
                </button>
              </form>

              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We'll check if you're an existing candidate or verify your email for new applications.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-[#003A70]/10 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-[#003A70] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Global Opportunities</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Access international job opportunities across various industries</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-[#003A70]/10 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-[#003A70] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Verified Process</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Secure and verified application process with real email validation</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-[#003A70]/10 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-[#003A70] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Fast Track</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Streamlined application process to get you started quickly</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#003A70] text-white">
          <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div>
                      <Image src="/logo-skills-white.png" alt="International Skills" width={180} height={45} className="mb-4" />
                      <p className="text-sm text-slate-300">
                          Connecting talented professionals with international opportunities.
                      </p>
                  </div>
                  
                  <div>
                      <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200">Contact</h3>
                      <div className="mt-4 space-y-3 text-sm text-slate-300">
                          <p className="flex items-center"><span className="mr-2 opacity-80"></span> wassim@internationalskills.fi</p>
                          <p className="flex items-center"><span className="mr-2 opacity-80"></span> +358 452644966</p>
                          <p className="flex items-center"><span className="mr-2 opacity-80"></span> +216 29 581 180</p>
                      </div>
                  </div>

                  <div>
                      <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200">Suivez-nous</h3>
                      <div className="mt-4 flex space-x-5">
                          <SocialIcon href="https://www.linkedin.com/company/international-skills-labor-company/">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"/></svg>
                          </SocialIcon>
                          <SocialIcon href="https://www.facebook.com/profile.php?id=61571369068485">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                          </SocialIcon>
                          <SocialIcon href="https://www.instagram.com/internationalskillscompany?igsh=MTI4enh4ODNzOGN5Mw%3D%3D">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" clipRule="evenodd" /><path d="M16.95 6.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6z" /></svg>
                          </SocialIcon>
                      </div>
                  </div>
              </div>
              <div className="mt-12 border-t border-slate-700 pt-8 text-center">
                  <p className="text-sm text-slate-400">© 2025 Wassim Abbessi. All Rights Reserved.</p>
              </div>
          </div>
      </footer>
    </div>
  );
}

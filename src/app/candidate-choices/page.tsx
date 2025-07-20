"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Helper component for social media icons in the footer
const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
    {children}
  </a>
);

export default function CandidateChoices() {
  const [candidateEmail, setCandidateEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
      setCandidateEmail(email);
    } else {
      router.push('/');
    }
  }, [router]);

  const handleNewApplication = () => {
    setIsLoading(true);
    router.push(`/candidate-form?email=${encodeURIComponent(candidateEmail)}`);
  };

  const handleViewApplications = () => {
    setIsLoading(true);
    router.push(`/candidate-dashboard?email=${encodeURIComponent(candidateEmail)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
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
                      src="/logo-skills.png"
                      alt="International Skills Labor Company"
                      width={180}
                      height={45}
                      priority
                  />
                  <button
                    onClick={() => router.push('/')}
                    className="text-[#003A70] hover:text-[#002B54] font-medium"
                  >
                    ← Back to Home
                  </button>
              </div>
          </nav>
      </header>
      
      {/* Hero Section */}
      <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-4xl text-center space-y-8">
          {/* Welcome Content */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#003A70] leading-tight">
              Welcome Back!
              <span className="block text-2xl sm:text-3xl text-slate-600 font-semibold mt-2">
                What would you like to do?
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We found existing applications for <strong>{candidateEmail}</strong>. 
              Choose an option below to continue.
            </p>
          </div>

          {/* Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {/* New Application Card */}
            <div className="bg-white p-8 rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 hover:shadow-3xl transition-shadow">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-[#003A70]/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-[#003A70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#003A70]">New Application</h2>
                  <p className="text-slate-500">
                    Submit a fresh application for a new job opportunity. 
                    Fill out the complete application form with your latest information.
                  </p>
                </div>

                <button
                  onClick={handleNewApplication}
                  disabled={isLoading}
                  className="w-full px-8 py-4 bg-[#003A70] text-white font-bold text-lg tracking-wide rounded-xl shadow-lg hover:bg-[#002B54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003A70] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Start New Application'
                  )}
                </button>
              </div>
            </div>

            {/* View Applications Card */}
            <div className="bg-white p-8 rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 hover:shadow-3xl transition-shadow">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-600">Review Applications</h2>
                  <p className="text-slate-500">
                    View and manage your existing applications. 
                    Check application status, interview schedules, and download documents.
                  </p>
                </div>

                <button
                  onClick={handleViewApplications}
                  disabled={isLoading}
                  className="w-full px-8 py-4 bg-green-600 text-white font-bold text-lg tracking-wide rounded-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'View My Applications'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Need Help?</h3>
                <p className="text-sm text-blue-700">
                  If you have questions about your applications or need assistance, 
                  please contact us at{' '}
                  <a href="mailto:wassim@internationalskills.fi" className="underline hover:text-blue-800">
                    wassim@internationalskills.fi
                  </a>{' '}
                  or call{' '}
                  <a href="tel:+358452644966" className="underline hover:text-blue-800">
                    +358 452644966
                  </a>.
                </p>
              </div>
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
                          <p className="flex items-center"><span className="mr-2 opacity-80">📧</span> wassim@internationalskills.fi</p>
                          <p className="flex items-center"><span className="mr-2 opacity-80">📞</span> +358 452644966</p>
                          <p className="flex items-center"><span className="mr-2 opacity-80">📞</span> +216 29 581 180</p>
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
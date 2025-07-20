"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types';

// Helper component for social media icons in the footer
const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
    {children}
  </a>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interview_scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Application Submitted';
      case 'interview_scheduled':
        return 'Interview Scheduled';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

export default function CandidateDashboard() {
  const [candidateEmail, setCandidateEmail] = useState('');
  const [applications, setApplications] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
      setCandidateEmail(email);
      loadApplications(email);
    } else {
      router.push('/');
    }
  }, [router]);

  const loadApplications = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/get-candidate-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load applications');
      }

      setApplications(result.applications || []);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewApplication = () => {
    router.push(`/candidate-form?email=${encodeURIComponent(candidateEmail)}`);
  };

  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // 🔥 FIX: Handle both Firestore Timestamp and regular Date objects
    let date: Date;
    if (timestamp && typeof timestamp.toDate === 'function') {
      // It's a Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // It's already a Date object
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      // It's a string, parse it
      date = new Date(timestamp);
    } else {
      return 'N/A';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🔥 FIX: Helper function to safely convert timestamp to Date
  const timestampToDate = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    } else if (timestamp instanceof Date) {
      return timestamp;
    } else if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#003A70] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

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
      
      {/* Main Content */}
      <main className="flex min-h-screen flex-col items-center justify-start py-12 px-4 sm:px-6">
        <div className="w-full max-w-6xl space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003A70]">
              Welcome Back!
            </h1>
            <p className="text-lg text-slate-600">
              Manage your applications for <strong>{candidateEmail}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleNewApplication}
              className="px-8 py-4 bg-[#003A70] text-white font-bold text-lg tracking-wide rounded-xl shadow-lg hover:bg-[#002B54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003A70] transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Submit New Application</span>
              </div>
            </button>
          </div>

          {/* 🔥 APPLICATION GUIDELINES SECTION */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Application Guidelines</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• You can apply to the same position once every <strong>6 months</strong></p>
                  <p>• Maximum <strong>3 applications</strong> per job category per month</p>
                  <p>• All applications are reviewed within <strong>5-7 business days</strong></p>
                  <p>• You'll receive email notifications for status updates</p>
                  <p>• Your information will be pre-filled for faster applications</p>
                </div>
                
                {/* Application Statistics */}
                {applications.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Your Application Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Total Applications:</span>
                        <span className="font-semibold ml-2">{applications.length}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">This Month:</span>
                        <span className="font-semibold ml-2">
                          {applications.filter(app => {
                            const submittedDate = timestampToDate(app.submittedAt);
                            if (!submittedDate) return false;
                            
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            return submittedDate >= thirtyDaysAgo;
                          }).length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Recent category applications warning */}
                    {(() => {
                      // 🔥 FIX: Filter with proper date conversion and null checking
                      const recentApps = applications.filter(app => {
                        const submittedDate = timestampToDate(app.submittedAt);
                        if (!submittedDate) return false;
                        
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return submittedDate >= thirtyDaysAgo;
                      });
                      
                      // 🔥 FIX: Handle undefined jobCategory safely
                      const categoryCount = recentApps.reduce((acc, app) => {
                        const category = app.jobCategory;
                        if (category) { // Only count if category exists
                          acc[category] = (acc[category] || 0) + 1;
                        }
                        return acc;
                      }, {} as Record<string, number>);
                      
                      const nearLimit = Object.entries(categoryCount).filter(([_, count]) => count >= 2);
                      
                      if (nearLimit.length > 0) {
                        return (
                          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                            <p className="text-xs text-yellow-800">
                              ⚠️ You're approaching the limit for: {nearLimit.map(([cat, count]) => `${cat} (${count}/3)`).join(', ')}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Applications Section */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Your Applications</h2>
                <span className="text-sm text-slate-500">
                  {applications.length} {applications.length === 1 ? 'application' : 'applications'}
                </span>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {applications.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-medium text-slate-600">No Applications Yet</h3>
                  <p className="text-slate-500">
                    You haven't submitted any applications yet. Click the button above to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-slate-800">
                              {app.jobTitleText || 'Job Application'}
                            </h3>
                            <StatusBadge status={app.status} />
                          </div>
                          
                          <div className="space-y-1 text-sm text-slate-600">
                            <p><strong>Category:</strong> {app.jobCategory || 'N/A'}</p>
                            {app.specialty && <p><strong>Specialty:</strong> {app.specialty}</p>}
                            <p><strong>Submitted:</strong> {formatDate(app.submittedAt)}</p>
                            {app.score !== null && app.score !== undefined && (
                              <p><strong>Score:</strong> <span className="font-medium">{app.score}/100</span></p>
                            )}
                            {app.interviewDate && (
                              <p><strong>Interview:</strong> {formatDate(app.interviewDate)}</p>
                            )}
                            {app.meetLink && (
                              <p>
                                <strong>Meeting Link:</strong>{' '}
                                <a
                                  href={app.meetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  Join Interview
                                </a>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {app.cvUrl && (
                            <a
                              href={app.cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#003A70] bg-[#003A70]/10 rounded-lg hover:bg-[#003A70]/20 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Download CV
                            </a>
                          )}
                          
                          {app.passportUrl && (
                            <a
                              href={app.passportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                                />
                              </svg>
                              View Passport
                            </a>
                          )}

                          {app.photoUrl && (
                            <a
                              href={app.photoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              View Photo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700 mb-3">
                  If you have questions about your applications or need assistance, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-blue-700">
                    📧 Email:{' '}
                    <a href="mailto:wassim@internationalskills.fi" className="underline hover:text-blue-800">
                      wassim@internationalskills.fi
                    </a>
                  </p>
                  <p className="text-blue-700">
                    📞 Phone:{' '}
                    <a href="tel:+358452644966" className="underline hover:text-blue-800">
                      +358 452644966
                    </a>
                  </p>
                </div>
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
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.562 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
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
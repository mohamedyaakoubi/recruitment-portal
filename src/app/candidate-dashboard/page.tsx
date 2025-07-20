"use client";

import React from 'react';
import { useCandidateDashboard } from '@/hooks/useCandidateDashboard';
import ApplicationStatus from '../components/candidate-dashboard/ApplicationStatus';
import InterviewDetails from '../components/candidate-dashboard/InterviewDetails';
import DashboardHeader from '../components/candidate-dashboard/DashboardHeader';
import DashboardFooter from '../components/candidate-dashboard/DashboardFooter';
import WelcomeSection from '../components/candidate-dashboard/WelcomeSection';
import HelpSection from '../components/candidate-dashboard/HelpSection';

export default function CandidateDashboard() {
  const {
    candidateEmail,
    applications,
    isLoading,
    error,
    handleNewApplication,
    formatDate,
  } = useCandidateDashboard();

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
      <DashboardHeader />
      
      <main className="flex min-h-screen flex-col items-center justify-start py-12 px-4 sm:px-6">
        <div className="w-full max-w-6xl space-y-8">
          <WelcomeSection
            candidateEmail={candidateEmail}
            handleNewApplication={handleNewApplication}
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <ApplicationStatus applications={applications} formatDate={formatDate} />
          
          <InterviewDetails applications={applications} formatDate={formatDate} />

          <HelpSection />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

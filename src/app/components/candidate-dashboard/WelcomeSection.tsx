'use client';

import React from 'react';

interface WelcomeSectionProps {
  candidateEmail: string;
  handleNewApplication: () => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  candidateEmail,
  handleNewApplication,
}) => {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-3xl font-extrabold text-[#003A70] sm:text-4xl">Welcome Back!</h1>
      <p className="text-lg text-slate-600">
        Manage your applications for <strong>{candidateEmail}</strong>
      </p>
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <button
          onClick={handleNewApplication}
          className="transform rounded-xl bg-[#003A70] px-8 py-4 text-lg font-bold tracking-wide text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-[#002B54] focus:outline-none focus:ring-2 focus:ring-[#003A70] focus:ring-offset-2"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Submit New Application</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default WelcomeSection;

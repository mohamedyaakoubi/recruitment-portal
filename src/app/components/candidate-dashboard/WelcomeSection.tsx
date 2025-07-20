"use client";

import React from 'react';

interface WelcomeSectionProps {
    candidateEmail: string;
    handleNewApplication: () => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ candidateEmail, handleNewApplication }) => {
    return (
        <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003A70]">
                Welcome Back!
            </h1>
            <p className="text-lg text-slate-600">
                Manage your applications for <strong>{candidateEmail}</strong>
            </p>
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
        </div>
    );
};

export default WelcomeSection;

// src/app/components/candidate-dashboard/ApplicationStatus.tsx
import React from 'react';
import { Candidate } from '@/types';
import ApplicationCard from './ApplicationCard';

interface ApplicationStatusProps {
  applications: Candidate[];
  formatDate: (timestamp: { toDate?: () => Date } | Date | string | null | undefined) => string;
}

const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ applications, formatDate }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none sm:p-8">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Your Applications</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {applications.length} {applications.length === 1 ? 'application' : 'applications'}
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="space-y-4 py-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-medium text-slate-600 dark:text-slate-300">
            No Applications Yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            You haven't submitted any applications yet. Click the button above to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <ApplicationCard key={app.id} candidate={app} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default ApplicationStatus;

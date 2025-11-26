'use client';

import React from 'react';
import { Candidate } from '@/types';
import StatusBadge from '../ui/StatusBadge';

interface ApplicationCardProps {
  candidate: Candidate;
  formatDate: (timestamp: { toDate?: () => Date } | Date | string | null | undefined) => string;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ candidate: app, formatDate }) => {
  return (
    <div
      key={app.id}
      className="rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:hover:border-gray-600"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-grow space-y-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              {app.jobTitleText || 'Job Application'}
            </h3>
            <StatusBadge status={app.status} />
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
            <p>
              <strong>Category:</strong> {app.jobCategory || 'N/A'}
            </p>
            {app.specialty && (
              <p>
                <strong>Specialty:</strong> {app.specialty}
              </p>
            )}
            <p>
              <strong>Submitted:</strong> {formatDate(app.submittedAt)}
            </p>
            {app.score !== null && app.score !== undefined && (
              <p>
                <strong>Score:</strong> <span className="font-medium">{app.score}/100</span>
              </p>
            )}
            {app.interviewDate && (
              <p>
                <strong>Interview:</strong> {formatDate(app.interviewDate)}
              </p>
            )}
            {app.meetLink && (
              <p className="md:col-span-2">
                <strong>Meeting Link:</strong>{' '}
                <a
                  href={app.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Join Interview
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-col space-y-2">
          {app.cvUrl && (
            <a
              href={app.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-[#003A70]/10 px-3 py-2 text-sm font-medium text-[#003A70] transition-colors hover:bg-[#003A70]/20 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/80"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Download CV</span>
            </a>
          )}

          {app.passportUrl && (
            <a
              href={app.passportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/80"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
              <span>View Passport</span>
            </a>
          )}

          {app.photoUrl && (
            <a
              href={app.photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900/80"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>View Photo</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;

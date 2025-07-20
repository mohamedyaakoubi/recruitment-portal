// src/app/components/candidate-dashboard/InterviewDetails.tsx
import React from 'react';
import { Candidate } from '@/types';

interface InterviewDetailsProps {
  applications: Candidate[];
  formatDate: (timestamp: any) => string;
}

const InterviewDetails: React.FC<InterviewDetailsProps> = ({ applications, formatDate }) => {
  const scheduledInterviews = applications.filter(app => app.status === 'interview_scheduled');

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Upcoming Interviews</h2>
      {scheduledInterviews.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-3 8v4m0 0l-3-3m3 3l3-3m-3-4a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-xl font-medium text-slate-600">No Upcoming Interviews</h3>
          <p className="text-slate-500">
            You have no interviews scheduled at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {scheduledInterviews.map(app => (
            <div key={app.id} className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800">{app.jobTitleText}</h3>
              <p className="text-sm text-slate-600"><strong>Date:</strong> {formatDate(app.interviewDate)}</p>
              <a href={app.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Join Interview</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewDetails;

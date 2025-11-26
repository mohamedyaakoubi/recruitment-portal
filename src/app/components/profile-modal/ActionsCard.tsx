'use client';

import React from 'react';
import { FiEdit, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import type { Candidate } from '@/types';
import { InfoCard } from './InfoCard';

interface ActionsCardProps {
  candidate: Candidate;
  onStatusChange: (candidateId: string, newStatus: string) => void;
  onScheduleInterview: () => void;
  statusUpdateLoading: boolean;
}

const ActionsCard: React.FC<ActionsCardProps> = ({
  candidate,
  onStatusChange,
  onScheduleInterview,
  statusUpdateLoading,
}) => {
  const handleReject = () => onStatusChange(candidate.id, 'rejected');
  const handleApprove = () => onStatusChange(candidate.id, 'approved');

  const renderActionButtons = () => {
    if (candidate.status === 'approved' || candidate.status === 'rejected') {
      return (
        <div className="py-4 text-center italic text-gray-600 dark:text-gray-400">
          This candidate has been <strong>{candidate.status}</strong>.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {candidate.status === 'submitted' && (
          <button
            onClick={onScheduleInterview}
            disabled={statusUpdateLoading}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <FiCalendar className="mr-2" />{' '}
            {statusUpdateLoading ? 'Processing...' : 'Schedule Interview'}
          </button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleApprove}
            disabled={statusUpdateLoading}
            className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            <FiCheckCircle className="mr-2" /> {statusUpdateLoading ? 'Approving...' : 'Approve'}
          </button>
          <button
            onClick={handleReject}
            disabled={statusUpdateLoading}
            className="flex w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            <FiXCircle className="mr-2" /> {statusUpdateLoading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <InfoCard title="Actions" icon={<FiEdit size={20} />}>
      {renderActionButtons()}
    </InfoCard>
  );
};

export default ActionsCard;

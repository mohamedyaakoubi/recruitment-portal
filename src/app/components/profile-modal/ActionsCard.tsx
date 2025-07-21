"use client";

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
                <div className="text-center py-4 text-gray-600 dark:text-gray-400 italic">
                    This candidate has been <strong>{candidate.status}</strong>.
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {candidate.status === 'submitted' && (
                     <button onClick={onScheduleInterview} disabled={statusUpdateLoading} className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        <FiCalendar className="mr-2" /> {statusUpdateLoading ? 'Processing...' : 'Schedule Interview'}
                    </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleApprove} disabled={statusUpdateLoading} className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
                        <FiCheckCircle className="mr-2" /> {statusUpdateLoading ? '...' : 'Approve'}
                    </button>
                    <button onClick={handleReject} disabled={statusUpdateLoading} className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">
                        <FiXCircle className="mr-2" /> {statusUpdateLoading ? '...' : 'Reject'}
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

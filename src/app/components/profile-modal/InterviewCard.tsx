"use client";

import React from 'react';
import { format } from 'date-fns';
import { FiCalendar, FiClock, FiExternalLink, FiEdit, FiTrash2 } from 'react-icons/fi';
import type { Candidate } from '@/types';
import { InfoCard, InfoRow } from './InfoCard';

interface InterviewCardProps {
    candidate: Candidate;
    onScheduleInterview: () => void;
    onCancelInterview: (candidateId: string, reason?: string) => void;
    statusUpdateLoading: boolean;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
    candidate,
    onScheduleInterview,
    onCancelInterview,
    statusUpdateLoading,
}) => {
    if (candidate?.status !== 'interview_scheduled' || !candidate?.interviewDate) {
        return null;
    }

    const interviewDate = candidate.interviewDate.toDate();
    const duration = candidate.duration || 30;
    const endDate = new Date(interviewDate.getTime() + duration * 60 * 1000);

    return (
        <InfoCard title="Interview Details" icon={<FiCalendar size={20} />}>
            {candidate.meetLink && (
                <div className="pb-3 mb-3 border-b border-slate-200 dark:border-gray-700">
                    <a 
                        href={candidate.meetLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                    >
                        <FiExternalLink className="mr-2" /> Join Google Meet
                    </a>
                </div>
            )}
            <InfoRow label="Date" value={format(interviewDate, 'PPP')} icon={<FiClock size={14} />} />
            <InfoRow label="Time" value={`${format(interviewDate, 'p')} - ${format(endDate, 'p')}`} icon={<FiClock size={14} />} />
            <InfoRow label="Duration" value={`${duration} minutes`} icon={<FiClock size={14} />} />
            
            <div className="pt-3 flex space-x-2">
                <button onClick={onScheduleInterview} disabled={statusUpdateLoading} className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/80 disabled:opacity-50">
                    <FiEdit className="mr-2" /> Reschedule
                </button>
                <button onClick={() => onCancelInterview(candidate.id, 'Cancelled by admin')} disabled={statusUpdateLoading} className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900/80 disabled:opacity-50">
                    <FiTrash2 className="mr-2" /> Cancel
                </button>
            </div>
        </InfoCard>
    );
};

export default InterviewCard;
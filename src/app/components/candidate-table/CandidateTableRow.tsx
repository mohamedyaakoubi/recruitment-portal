"use client";

import React from 'react';
import { FiExternalLink } from 'react-icons/fi'; // 👈 ADD THIS IMPORT
import type { Candidate } from '@/types';
import StatusBadge from '../ui/StatusBadge';
import CandidateTableActions from './CandidateTableActions';

interface CandidateTableRowProps {
    candidate: Candidate;
    splitName: (fullName: string) => { firstName: string; lastName: string };
    calculateAge: (dateOfBirth: string) => number | null;
    onViewCandidate: (candidate: Candidate) => void;
    onScoreCandidate: (candidate: Candidate) => void;
    onEditCandidate?: (candidate: Candidate) => void;
}

const CandidateTableRow: React.FC<CandidateTableRowProps> = ({
    candidate,
    splitName,
    calculateAge,
    onViewCandidate,
    onScoreCandidate,
    onEditCandidate,
}) => {
    const { firstName, lastName } = splitName(candidate.fullName || '');
    const age = candidate.dateOfBirth ? calculateAge(candidate.dateOfBirth) : null;

    return (
        <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        {candidate.photoUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={candidate.photoUrl} alt="" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-400">{firstName.charAt(0)}{lastName.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{firstName} {lastName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">{candidate.email}</div>
                    </div>
                </div>
            </td>
            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {candidate.email}
            </td>
            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {age || 'N/A'}
            </td>
            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {candidate.city || 'N/A'}
            </td>
            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {candidate.country || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {candidate.submittedAt
                    ? new Date(candidate.submittedAt.toDate()).toLocaleDateString()
                    : 'N/A'
                }
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={candidate.status} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-200">
                {candidate.score !== null ? candidate.score : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                {candidate.status === 'interview_scheduled' && candidate.meetLink ? (
                    <a
                        href={candidate.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full text-white bg-green-600 hover:bg-green-700 transition-colors"
                        onClick={(e) => e.stopPropagation()} // Prevents row click from triggering modal
                    >
                        <FiExternalLink className="mr-1.5" />
                        Join Meet
                    </a>
                ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                )}
            </td>
            <CandidateTableActions
                candidate={candidate}
                onViewCandidate={onViewCandidate}
                onScoreCandidate={onScoreCandidate}
                onEditCandidate={onEditCandidate}
            />
        </tr>
    );
};

export default CandidateTableRow;

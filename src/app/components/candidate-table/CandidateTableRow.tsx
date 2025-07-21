"use client";

import React from 'react';
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
    const { firstName, lastName } = splitName(candidate.fullName);
    const age = candidate.dateOfBirth ? calculateAge(candidate.dateOfBirth) : null;

    return (
        <tr key={candidate.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {firstName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {lastName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {candidate.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {age || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {candidate.city || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {candidate.country || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {candidate.submittedAt
                    ? new Date(candidate.submittedAt.toDate()).toLocaleDateString()
                    : 'N/A'
                }
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={candidate.status} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                {candidate.score !== null ? candidate.score : 'N/A'}
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

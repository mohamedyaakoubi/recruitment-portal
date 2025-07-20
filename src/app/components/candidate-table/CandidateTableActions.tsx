"use client";

import React from 'react';
import type { Candidate } from '@/types';

interface CandidateTableActionsProps {
    candidate: Candidate;
    onViewCandidate: (candidate: Candidate) => void;
    onScoreCandidate: (candidate: Candidate) => void;
    onEditCandidate?: (candidate: Candidate) => void;
}

const CandidateTableActions: React.FC<CandidateTableActionsProps> = ({
    candidate,
    onViewCandidate,
    onScoreCandidate,
    onEditCandidate,
}) => {
    return (
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
            <button
                onClick={() => onViewCandidate(candidate)}
                className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-xs"
            >
                View
            </button>
            {onEditCandidate && (
                <button
                    onClick={() => onEditCandidate(candidate)}
                    className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs"
                >
                    Edit
                </button>
            )}
            <button
                onClick={() => onScoreCandidate(candidate)}
                className="text-purple-600 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded text-xs"
            >
                Score
            </button>
        </td>
    );
};

export default CandidateTableActions;

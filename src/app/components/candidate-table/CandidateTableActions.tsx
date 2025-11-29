'use client';
/* eslint-disable react/prop-types */

import React from 'react';
import type { Candidate } from '@/types';

interface CandidateTableActionsProps {
  candidate: Candidate;
  onViewCandidate: (candidate: Candidate) => void;
  onScoreCandidate: (candidate: Candidate) => void;
  onEditCandidate?: (candidate: Candidate) => void;
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactElement;
  srText: string;
  color: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon, srText, color }) => (
  <button
    onClick={onClick}
    className={`rounded-full p-2 text-${color}-500 hover:bg-${color}-100 dark:hover:bg-gray-700 hover:text-${color}-700 dark:text-${color}-400 dark:hover:text-${color}-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 transition-colors`}
  >
    <span className="sr-only">{srText}</span>
    {icon}
  </button>
);

const CandidateTableActions: React.FC<CandidateTableActionsProps> = React.memo(
  ({ candidate, onViewCandidate, onScoreCandidate, onEditCandidate }) => {
    return (
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-1">
          <ActionButton
            onClick={() => onViewCandidate(candidate)}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            }
            srText="View"
            color="blue"
          />
          {onEditCandidate && (
            <ActionButton
              onClick={() => onEditCandidate(candidate)}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
              srText="Edit"
              color="green"
            />
          )}
          <ActionButton
            onClick={() => onScoreCandidate(candidate)}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            }
            srText="Score"
            color="purple"
          />
        </div>
      </td>
    );
  }
);

CandidateTableActions.displayName = 'CandidateTableActions';

export default CandidateTableActions;

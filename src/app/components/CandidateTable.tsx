'use client';

import React from 'react';
import { useCandidateTable } from '@/hooks/useCandidateTable';
import type { CandidateTableProps } from '@/types';
import CandidateTableHeader from './candidate-table/CandidateTableHeader';
import CandidateTableRow from './candidate-table/CandidateTableRow';

const CandidateTable: React.FC<CandidateTableProps> = React.memo(
  ({
    candidates,
    statusUpdateLoading: _statusUpdateLoading,
    onViewCandidate,
    onScoreCandidate,
    onStatusChange: _onStatusChange,
    onEditCandidate,
    filters,
  }) => {
    const { sortField, sortDirection, handleSort, sortedCandidates, splitName, calculateAge } =
      useCandidateTable(candidates, filters);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <CandidateTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {sortedCandidates.length > 0 ? (
              sortedCandidates.map((candidate) => (
                <CandidateTableRow
                  key={candidate.id}
                  candidate={candidate}
                  splitName={splitName}
                  calculateAge={calculateAge}
                  onViewCandidate={onViewCandidate}
                  onScoreCandidate={onScoreCandidate}
                  onEditCandidate={onEditCandidate}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <svg
                      className="h-16 w-16 text-gray-300 dark:text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                      No candidates found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      No candidates match your current filters. Try adjusting your search.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
);

CandidateTable.displayName = 'CandidateTable';

export default CandidateTable;

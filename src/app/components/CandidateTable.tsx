"use client";

import React from 'react';
import { useCandidateTable } from '@/hooks/useCandidateTable';
import type { CandidateTableProps } from '@/types';
import CandidateTableHeader from './candidate-table/CandidateTableHeader';
import CandidateTableRow from './candidate-table/CandidateTableRow';

const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  statusUpdateLoading,
  onViewCandidate,
  onScoreCandidate,
  onStatusChange,
  onEditCandidate,
  filters
}) => {
  const {
    sortField,
    sortDirection,
    handleSort,
    sortedCandidates,
    splitName,
    calculateAge,
  } = useCandidateTable(candidates, filters);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <CandidateTableHeader
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
        />
        <tbody className="bg-white divide-y divide-gray-200">
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
              <td colSpan={8} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-semibold text-gray-700">No candidates found</h3>
                  <p className="mt-1 text-sm text-gray-500">
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
};

export default CandidateTable;


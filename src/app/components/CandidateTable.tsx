"use client";

import React from 'react';
import { useCandidateTable } from '@/hooks/useCandidateTable';
import type { CandidateTableProps } from '@/types';
import ExportButtons from './candidate-table/ExportButtons';
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
    isExporting,
    handleSort,
    handleExport,
    sortedCandidates,
    splitName,
    calculateAge,
  } = useCandidateTable(candidates, filters);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Candidate List</h3>
        <ExportButtons isExporting={isExporting} handleExport={handleExport} />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <CandidateTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCandidates.map((candidate) => (
              <CandidateTableRow
                key={candidate.id}
                candidate={candidate}
                splitName={splitName}
                calculateAge={calculateAge}
                onViewCandidate={onViewCandidate}
                onScoreCandidate={onScoreCandidate}
                onEditCandidate={onEditCandidate}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedCandidates.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4a1 1 0 00-1-1H9a1 1 0 00-1 1v1" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No candidates match your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateTable;


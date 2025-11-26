'use client';

import React from 'react';
import Image from 'next/image';
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
    <tr
      key={candidate.id}
      className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50"
    >
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            {candidate.photoUrl ? (
              <Image
                className="h-10 w-10 rounded-full object-cover"
                src={candidate.photoUrl}
                alt=""
                width={40}
                height={40}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                <span className="text-gray-500 dark:text-gray-400">
                  {firstName.charAt(0)}
                  {lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {firstName} {lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">
              {candidate.email}
            </div>
          </div>
        </div>
      </td>
      <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 md:table-cell">
        {candidate.email}
      </td>
      <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 md:table-cell">
        {age || 'N/A'}
      </td>
      <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 md:table-cell">
        {candidate.city || 'N/A'}
      </td>
      <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 md:table-cell">
        {candidate.country || 'N/A'}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {candidate.submittedAt
          ? new Date(candidate.submittedAt.toDate()).toLocaleDateString()
          : 'N/A'}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <StatusBadge status={candidate.status} />
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
        {candidate.score !== null ? candidate.score : 'N/A'}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-center">
        {candidate.status === 'interview_scheduled' && candidate.meetLink ? (
          <a
            href={candidate.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
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

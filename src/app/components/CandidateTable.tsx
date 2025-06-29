// src/app/components/CandidateTable.tsx
import React, { useState, useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';

import type { Candidate } from '@/types';

interface CandidateTableProps {
  candidates: Candidate[];
  statusUpdateLoading: Record<string, boolean>;
  onViewCandidate: (candidate: Candidate) => void;
  onScoreCandidate: (candidate: Candidate) => void;
  onStatusChange: (candidateId: string, newStatus: string) => void;
}

type SortField = 'firstName' | 'lastName' | 'email' | 'age' | 'city' | 'country' | 'submittedAt' | 'status' | 'score';
type SortDirection = 'asc' | 'desc';

const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  statusUpdateLoading,
  onViewCandidate,
  onScoreCandidate,
  onStatusChange
}) => {
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'firstName':
          aValue = splitName(a.fullName).firstName.toLowerCase();
          bValue = splitName(b.fullName).firstName.toLowerCase();
          break;
        case 'lastName':
          aValue = splitName(a.fullName).lastName.toLowerCase();
          bValue = splitName(b.fullName).lastName.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'age':
          aValue = a.dateOfBirth ? calculateAge(a.dateOfBirth) : 0;
          bValue = b.dateOfBirth ? calculateAge(b.dateOfBirth) : 0;
          break;
        case 'city':
          aValue = (a.city || '').toLowerCase();
          bValue = (b.city || '').toLowerCase();
          break;
        case 'country':
          aValue = (a.country || '').toLowerCase();
          bValue = (b.country || '').toLowerCase();
          break;
        case 'submittedAt':
          aValue = a.submittedAt?.toMillis() || 0;
          bValue = b.submittedAt?.toMillis() || 0;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [candidates, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      interview_scheduled: { bg: 'bg-green-100', text: 'text-green-800', label: 'Interview Scheduled' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Approved' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - 
      (today.getMonth() < birthDate.getMonth() || 
       (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
    return age;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Candidate List</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('firstName')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>First Name</span>
                  {getSortIcon('firstName')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('lastName')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Last Name</span>
                  {getSortIcon('lastName')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('email')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Email</span>
                  {getSortIcon('email')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('age')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Age</span>
                  {getSortIcon('age')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('city')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>City</span>
                  {getSortIcon('city')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('country')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Country</span>
                  {getSortIcon('country')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('submittedAt')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Submitted</span>
                  {getSortIcon('submittedAt')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Status</span>
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('score')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>AI Score</span>
                  {getSortIcon('score')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCandidates.map((candidate) => {
              const { firstName, lastName } = splitName(candidate.fullName);
              const age = candidate.dateOfBirth ? calculateAge(candidate.dateOfBirth) : null;
              
              return (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {firstName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {age || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.city || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.country || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.submittedAt 
                      ? new Date(candidate.submittedAt.toDate()).toLocaleDateString()
                      : 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(candidate.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.score !== null ? candidate.score : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onViewCandidate(candidate)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onScoreCandidate(candidate)}
                      className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs"
                    >
                      Score
                    </button>
                  </td>
                </tr>
              );
            })}
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


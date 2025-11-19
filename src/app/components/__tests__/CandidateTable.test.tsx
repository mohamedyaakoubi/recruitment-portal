import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CandidateTable from '../CandidateTable';
import { Candidate } from '@/types';

// Mock useCandidateTable hook
const mockUseCandidateTable = vi.fn();
vi.mock('@/hooks/useCandidateTable', () => ({
  useCandidateTable: () => mockUseCandidateTable(),
}));

// Mock child components to simplify testing
vi.mock('../candidate-table/CandidateTableHeader', () => ({
  default: ({ sortField, sortDirection, handleSort }: any) => (
    <thead>
      <tr>
        <th onClick={() => handleSort('fullName')}>Name ({sortField === 'fullName' ? sortDirection : ''})</th>
      </tr>
    </thead>
  ),
}));

vi.mock('../candidate-table/CandidateTableRow', () => ({
  default: ({ candidate, onViewCandidate }: any) => (
    <tr>
      <td>{candidate.fullName}</td>
      <td><button onClick={() => onViewCandidate(candidate)}>View</button></td>
    </tr>
  ),
}));

describe('CandidateTable', () => {
  const mockCandidates: Candidate[] = [
    { id: '1', fullName: 'John Doe', email: 'john@example.com', status: 'new' } as any,
    { id: '2', fullName: 'Jane Smith', email: 'jane@example.com', status: 'reviewed' } as any,
  ];

  const defaultHookReturn = {
    sortField: 'createdAt',
    sortDirection: 'desc',
    handleSort: vi.fn(),
    sortedCandidates: mockCandidates,
    splitName: (name: string) => [name],
    calculateAge: () => 30,
  };

  it('should render candidates when list is not empty', () => {
    mockUseCandidateTable.mockReturnValue(defaultHookReturn);

    render(
      <CandidateTable
        candidates={mockCandidates}
        statusUpdateLoading={{}}
        onViewCandidate={vi.fn()}
        onScoreCandidate={vi.fn()}
        onStatusChange={vi.fn()}
        onEditCandidate={vi.fn()}
        filters={{
          status: '',
          name: '',
          city: '',
          country: '',
          nationality: '',
          jobTitle: '',
          category: '',
          specialty: '',
          ageMin: '',
          ageMax: '',
        }}
      />
    );

    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
  });

  it('should render empty state when no candidates match', () => {
    mockUseCandidateTable.mockReturnValue({
      ...defaultHookReturn,
      sortedCandidates: [],
    });

    render(
      <CandidateTable
        candidates={[]}
        statusUpdateLoading={{}}
        onViewCandidate={vi.fn()}
        onScoreCandidate={vi.fn()}
        onStatusChange={vi.fn()}
        onEditCandidate={vi.fn()}
        filters={{
          status: '',
          name: '',
          city: '',
          country: '',
          nationality: '',
          jobTitle: '',
          category: '',
          specialty: '',
          ageMin: '',
          ageMax: '',
        }}
      />
    );

    expect(screen.getByText('No candidates found')).toBeDefined();
  });

  it('should call handleSort when header is clicked', () => {
    const handleSort = vi.fn();
    mockUseCandidateTable.mockReturnValue({
      ...defaultHookReturn,
      handleSort,
    });

    render(
      <CandidateTable
        candidates={mockCandidates}
        statusUpdateLoading={{}}
        onViewCandidate={vi.fn()}
        onScoreCandidate={vi.fn()}
        onStatusChange={vi.fn()}
        onEditCandidate={vi.fn()}
        filters={{
          status: '',
          name: '',
          city: '',
          country: '',
          nationality: '',
          jobTitle: '',
          category: '',
          specialty: '',
          ageMin: '',
          ageMax: '',
        }}
      />
    );

    fireEvent.click(screen.getByText(/Name/));
    expect(handleSort).toHaveBeenCalledWith('fullName');
  });
});
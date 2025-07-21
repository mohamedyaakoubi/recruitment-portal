import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CandidateTable from '../CandidateTable';
import { Candidate } from '@/types';
import { useCandidateTable } from '@/hooks/useCandidateTable';

jest.mock('@/hooks/useCandidateTable', () => ({
    useCandidateTable: jest.fn(),
}));

describe('CandidateTable', () => {
  const mockCandidates: Candidate[] = [
    { id: '1', fullName: 'Alice Smith', email: 'alice@example.com', status: 'submitted', submittedAt: { toDate: () => new Date() } },
    { id: '2', fullName: 'Bob Johnson', email: 'bob@example.com', status: 'interview_scheduled', submittedAt: { toDate: () => new Date() } },
  ];

  const defaultProps = {
    candidates: mockCandidates,
    statusUpdateLoading: {},
    onViewCandidate: jest.fn(),
    onScoreCandidate: jest.fn(),
    onStatusChange: jest.fn(),
    onEditCandidate: jest.fn(),
    filters: {},
  };

  const mockUseCandidateTable = useCandidateTable as jest.Mock;

  beforeEach(() => {
    mockUseCandidateTable.mockClear();
  });

  it('renders the table with candidate data', () => {
    mockUseCandidateTable.mockReturnValue({
        sortedCandidates: mockCandidates,
        sortField: 'firstName',
        sortDirection: 'asc',
        handleSort: jest.fn(),
        splitName: (name: string) => ({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] }),
        calculateAge: () => 30,
        isExporting: false,
        handleExport: jest.fn(),
    });
    render(<CandidateTable {...defaultProps} />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('renders the "No candidates found" message when there are no candidates', () => {
    mockUseCandidateTable.mockReturnValue({
        sortedCandidates: [],
        sortField: 'firstName',
        sortDirection: 'asc',
        handleSort: jest.fn(),
        splitName: (name: string) => ({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] }),
        calculateAge: () => 30,
        isExporting: false,
        handleExport: jest.fn(),
    });
    render(<CandidateTable {...defaultProps} candidates={[]} />);
    expect(screen.getByText('No candidates found')).toBeInTheDocument();
  });

  it('calls handleSort when a table header is clicked', () => {
    const handleSort = jest.fn();
    mockUseCandidateTable.mockReturnValue({
        sortedCandidates: mockCandidates,
        sortField: 'firstName',
        sortDirection: 'asc',
        handleSort,
        splitName: (name: string) => ({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] }),
        calculateAge: () => 30,
        isExporting: false,
        handleExport: jest.fn(),
    });

    render(<CandidateTable {...defaultProps} />);
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    expect(handleSort).toHaveBeenCalledWith('firstName');
  });
});
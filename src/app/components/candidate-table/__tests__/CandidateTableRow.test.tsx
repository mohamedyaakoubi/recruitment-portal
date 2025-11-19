import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CandidateTableRow from '../CandidateTableRow';
import '@testing-library/jest-dom';

vi.mock('../CandidateTableActions', () => ({
  default: () => <td data-testid="actions-mock">Actions</td>
}));

describe('CandidateTableRow', () => {
  const candidate = {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    status: 'submitted',
    dateOfBirth: '1990-01-01',
    city: 'Test City',
    country: 'Test Country',
    score: 85,
    submittedAt: { toDate: () => new Date('2023-01-01') },
  };

  const defaultProps = {
    candidate,
    splitName: (name: string) => ({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] }),
    calculateAge: () => 33,
    onViewCandidate: vi.fn(),
    onScoreCandidate: vi.fn(),
    onEditCandidate: vi.fn(),
  };

  const renderInTable = (ui: React.ReactElement) => {
    return render(
      <table>
        <tbody>{ui}</tbody>
      </table>
    );
  };

  it("should render the candidate's full name and email", () => {
    renderInTable(<CandidateTableRow {...defaultProps} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
  });

  it("should display the candidate's age if dateOfBirth is provided", () => {
    renderInTable(<CandidateTableRow {...defaultProps} />);
    expect(screen.getByText('33')).toBeInTheDocument();
  });

  it('should display "N/A" for age if dateOfBirth is not provided', () => {
    const candidateWithoutDob = { ...candidate, dateOfBirth: undefined };
    renderInTable(<CandidateTableRow {...defaultProps} candidate={candidateWithoutDob} calculateAge={() => null} />);
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });

  it("should display the candidate's city and country", () => {
    renderInTable(<CandidateTableRow {...defaultProps} />);
    expect(screen.getByText('Test City')).toBeInTheDocument();
    expect(screen.getByText('Test Country')).toBeInTheDocument();
  });

  it('should display the submitted date', () => {
    renderInTable(<CandidateTableRow {...defaultProps} />);
    expect(screen.getByText(new Date('2023-01-01').toLocaleDateString())).toBeInTheDocument();
  });

  it('should display the AI score', () => {
    renderInTable(<CandidateTableRow {...defaultProps} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should display the status badge', () => {
    renderInTable(<CandidateTableRow {...defaultProps} />);
    expect(screen.getByText('Application Submitted')).toBeInTheDocument();
  });

  it('should render the actions component', () => {
    renderInTable(<CandidateTableRow {...defaultProps} />);
    expect(screen.getByTestId('actions-mock')).toBeInTheDocument();
  });
});
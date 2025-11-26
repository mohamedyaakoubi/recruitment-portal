import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CandidateTableActions from '../CandidateTableActions';
import '@testing-library/jest-dom';

describe('CandidateTableActions', () => {
  const onViewCandidateMock = vi.fn();
  const onScoreCandidateMock = vi.fn();
  const onEditCandidateMock = vi.fn();

  const candidate = {
    id: '1',
    fullName: 'Test User',
    email: 'test@test.com',
    status: 'submitted',
    submittedAt: { toDate: () => new Date() },
  };

  const defaultProps = {
    candidate,
    onViewCandidate: onViewCandidateMock,
    onScoreCandidate: onScoreCandidateMock,
  };

  const renderInTable = (ui: React.ReactElement) => {
    return render(
      <table>
        <tbody>
          <tr>{ui}</tr>
        </tbody>
      </table>
    );
  };

  beforeEach(() => {
    onViewCandidateMock.mockClear();
    onScoreCandidateMock.mockClear();
    onEditCandidateMock.mockClear();
  });

  it('should render the "View" and "Score" buttons', () => {
    renderInTable(<CandidateTableActions {...defaultProps} />);
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
  });

  it('should render the "Edit" button when onEditCandidate is provided', () => {
    renderInTable(
      <CandidateTableActions {...defaultProps} onEditCandidate={onEditCandidateMock} />
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('should not render the "Edit" button when onEditCandidate is not provided', () => {
    renderInTable(<CandidateTableActions {...defaultProps} />);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('should call onViewCandidate when the "View" button is clicked', () => {
    renderInTable(<CandidateTableActions {...defaultProps} />);
    fireEvent.click(screen.getByText('View'));
    expect(onViewCandidateMock).toHaveBeenCalledWith(candidate);
  });

  it('should call onScoreCandidate when the "Score" button is clicked', () => {
    renderInTable(<CandidateTableActions {...defaultProps} />);
    fireEvent.click(screen.getByText('Score'));
    expect(onScoreCandidateMock).toHaveBeenCalledWith(candidate);
  });

  it('should call onEditCandidate when the "Edit" button is clicked', () => {
    renderInTable(
      <CandidateTableActions {...defaultProps} onEditCandidate={onEditCandidateMock} />
    );
    fireEvent.click(screen.getByText('Edit'));
    expect(onEditCandidateMock).toHaveBeenCalledWith(candidate);
  });
});

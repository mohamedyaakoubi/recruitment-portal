
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionsCard from '../ActionsCard';
import '@testing-library/jest-dom';

describe('ActionsCard', () => {
  const onStatusChangeMock = jest.fn();
  const onScheduleInterviewMock = jest.fn();

  const candidate = {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    status: 'submitted',
    submittedAt: { toDate: () => new Date() },
  };

  const defaultProps = {
    candidate,
    onStatusChange: onStatusChangeMock,
    onScheduleInterview: onScheduleInterviewMock,
    statusUpdateLoading: false,
  };

  beforeEach(() => {
    onStatusChangeMock.mockClear();
    onScheduleInterviewMock.mockClear();
  });

  it('should render the "Schedule Interview", "Approve", and "Reject" buttons when the candidate status is "submitted"', () => {
    render(<ActionsCard {...defaultProps} />);
    expect(screen.getByText('Schedule Interview')).toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('should render the "Approve" and "Reject" buttons when the candidate status is "interview_scheduled"', () => {
    const interviewScheduledCandidate = { ...candidate, status: 'interview_scheduled' };
    render(<ActionsCard {...defaultProps} candidate={interviewScheduledCandidate} />);
    expect(screen.queryByText('Schedule Interview')).not.toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('should render a message when the candidate status is "approved"', () => {
    const approvedCandidate = { ...candidate, status: 'approved' };
    render(<ActionsCard {...defaultProps} candidate={approvedCandidate} />);
    expect(screen.getByText(/This candidate has been/)).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  it('should render a message when the candidate status is "rejected"', () => {
    const rejectedCandidate = { ...candidate, status: 'rejected' };
    render(<ActionsCard {...defaultProps} candidate={rejectedCandidate} />);
    expect(screen.getByText(/This candidate has been/)).toBeInTheDocument();
    expect(screen.getByText('rejected')).toBeInTheDocument();
  });

  it('should call onScheduleInterview when the "Schedule Interview" button is clicked', () => {
    render(<ActionsCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Schedule Interview'));
    expect(onScheduleInterviewMock).toHaveBeenCalledTimes(1);
  });

  it('should call onStatusChange with "approved" when the "Approve" button is clicked', () => {
    render(<ActionsCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Approve'));
    expect(onStatusChangeMock).toHaveBeenCalledWith('1', 'approved');
  });

  it('should call onStatusChange with "rejected" when the "Reject" button is clicked', () => {
    render(<ActionsCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Reject'));
    expect(onStatusChangeMock).toHaveBeenCalledWith('1', 'rejected');
  });

  it('should disable the buttons when statusUpdateLoading is true', () => {
    render(<ActionsCard {...defaultProps} statusUpdateLoading={true} />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByText('Approving...')).toBeInTheDocument();
    expect(screen.getByText('Rejecting...')).toBeInTheDocument();
    expect(screen.getByText('Processing...').closest('button')).toBeDisabled();
    expect(screen.getByText('Approving...').closest('button')).toBeDisabled();
    expect(screen.getByText('Rejecting...').closest('button')).toBeDisabled();
  });
});

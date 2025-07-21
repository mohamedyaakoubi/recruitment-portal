
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InterviewCard from '../InterviewCard';
import '@testing-library/jest-dom';

describe('InterviewCard', () => {
  const onScheduleInterviewMock = jest.fn();
  const onCancelInterviewMock = jest.fn();

  const candidate = {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    status: 'interview_scheduled',
    interviewDate: { toDate: () => new Date('2023-01-01T12:00:00Z') },
    duration: 45,
    meetLink: 'http://meet.google.com',
    submittedAt: { toDate: () => new Date() },
  };

  const defaultProps = {
    candidate,
    onScheduleInterview: onScheduleInterviewMock,
    onCancelInterview: onCancelInterviewMock,
    statusUpdateLoading: false,
  };

  beforeEach(() => {
    onScheduleInterviewMock.mockClear();
    onCancelInterviewMock.mockClear();
  });

  it('should not render if the candidate status is not "interview_scheduled"', () => {
    const { container } = render(<InterviewCard {...defaultProps} candidate={{ ...candidate, status: 'submitted' }} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render if interviewDate is not provided', () => {
    const { container } = render(<InterviewCard {...defaultProps} candidate={{ ...candidate, interviewDate: undefined }} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the interview details correctly', () => {
    render(<InterviewCard {...defaultProps} />);
    expect(screen.getByText('Interview Details')).toBeInTheDocument();
    expect(screen.getByText(/Date/)).toBeInTheDocument();
    expect(screen.getByText(/Time/)).toBeInTheDocument();
    expect(screen.getByText(/Duration/)).toBeInTheDocument();
    expect(screen.getByText('45 minutes')).toBeInTheDocument();
  });

  it('should render the "Join Google Meet" link if meetLink is provided', () => {
    render(<InterviewCard {...defaultProps} />);
    expect(screen.getByText('Join Google Meet')).toBeInTheDocument();
  });

  it('should call onScheduleInterview when the "Reschedule" button is clicked', () => {
    render(<InterviewCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Reschedule'));
    expect(onScheduleInterviewMock).toHaveBeenCalledTimes(1);
  });

  it('should call onCancelInterview when the "Cancel" button is clicked', () => {
    render(<InterviewCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancelInterviewMock).toHaveBeenCalledWith('1', 'Cancelled by admin');
  });

  it('should disable the buttons when statusUpdateLoading is true', () => {
    render(<InterviewCard {...defaultProps} statusUpdateLoading={true} />);
    expect(screen.getByText('Reschedule').closest('button')).toBeDisabled();
    expect(screen.getByText('Cancel').closest('button')).toBeDisabled();
  });
});

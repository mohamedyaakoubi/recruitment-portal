
import React from 'react';
import { render, screen } from '@testing-library/react';
import InterviewDetails from '../InterviewDetails';
import '@testing-library/jest-dom';

describe('InterviewDetails', () => {
  const formatDateMock = jest.fn((date) => new Date(date.toDate()).toLocaleDateString());

  const applications = [
    {
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      status: 'submitted',
      jobTitleText: 'Software Engineer',
      submittedAt: { toDate: () => new Date() },
    },
    {
      id: '2',
      fullName: 'Test User 2',
      email: 'test2@example.com',
      status: 'interview_scheduled',
      jobTitleText: 'Product Manager',
      interviewDate: { toDate: () => new Date('2023-03-01') },
      meetLink: 'http://meet.google.com',
      submittedAt: { toDate: () => new Date() },
    },
  ];

  it('should render the "No Upcoming Interviews" message when there are no scheduled interviews', () => {
    render(<InterviewDetails applications={[applications[0]]} formatDate={formatDateMock} />);
    expect(screen.getByText('No Upcoming Interviews')).toBeInTheDocument();
  });

  it('should render the interview details correctly when there are scheduled interviews', () => {
    render(<InterviewDetails applications={applications} formatDate={formatDateMock} />);
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText(/Date:/)).toBeInTheDocument();
    expect(screen.getByText(new Date('2023-03-01').toLocaleDateString())).toBeInTheDocument();
  });

  it('should render the "Join Interview" link', () => {
    render(<InterviewDetails applications={applications} formatDate={formatDateMock} />);
    const joinLink = screen.getByText('Join Interview');
    expect(joinLink).toBeInTheDocument();
    expect(joinLink).toHaveAttribute('href', 'http://meet.google.com');
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import ApplicationDetailsCard from '../ApplicationDetailsCard';
import '@testing-library/jest-dom';

describe('ApplicationDetailsCard', () => {
  const candidate = {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    status: 'submitted',
    jobCategory: 'IT',
    specialty: 'Frontend',
    jobTitle: 'job1',
    submittedAt: { toDate: () => new Date('2023-01-01T12:00:00Z') },
  };

  it('should render the application details correctly', () => {
    render(<ApplicationDetailsCard candidate={candidate} />);
    expect(screen.getByText('Application Details')).toBeInTheDocument();
    expect(screen.getByText(/^Category/)).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
    expect(screen.getByText(/^Specialty/)).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText(/^Job ID/)).toBeInTheDocument();
    expect(screen.getByText('job1')).toBeInTheDocument();
    expect(screen.getByText(/^Submitted/)).toBeInTheDocument();
    expect(screen.getByText(new Date('2023-01-01T12:00:00Z').toLocaleString())).toBeInTheDocument();
    expect(screen.getByText(/^Application ID/)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render the status badge', () => {
    render(<ApplicationDetailsCard candidate={candidate} />);
    expect(screen.getByText('Application Submitted')).toBeInTheDocument();
  });
});

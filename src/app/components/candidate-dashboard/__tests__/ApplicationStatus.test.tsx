import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ApplicationStatus from '../ApplicationStatus';
import '@testing-library/jest-dom';

describe('ApplicationStatus', () => {
  const formatDateMock = vi.fn((date) => new Date(date.toDate()).toLocaleDateString());

  const applications = [
    {
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      status: 'submitted',
      jobTitleText: 'Software Engineer',
      jobCategory: 'IT',
      specialty: 'Frontend',
      score: 85,
      submittedAt: { toDate: () => new Date('2023-01-01') },
      cvUrl: 'http://example.com/cv.pdf',
      passportUrl: 'http://example.com/passport.pdf',
      photoUrl: 'http://example.com/photo.jpg',
    },
    {
      id: '2',
      fullName: 'Test User 2',
      email: 'test2@example.com',
      status: 'interview_scheduled',
      jobTitleText: 'Product Manager',
      jobCategory: 'Product',
      specialty: 'Mobile',
      score: 90,
      submittedAt: { toDate: () => new Date('2023-02-01') },
      interviewDate: { toDate: () => new Date('2023-03-01') },
      meetLink: 'http://meet.google.com',
      cvUrl: 'http://example.com/cv2.pdf',
      passportUrl: 'http://example.com/passport2.pdf',
    },
  ];

  it('should render the "No Applications Yet" message when there are no applications', () => {
    render(<ApplicationStatus applications={[]} formatDate={formatDateMock} />);
    expect(screen.getByText('No Applications Yet')).toBeInTheDocument();
  });

  it('should render the application details correctly when there are applications', () => {
    render(<ApplicationStatus applications={applications} formatDate={formatDateMock} />);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('85/100')).toBeInTheDocument();
    expect(screen.getByText('90/100')).toBeInTheDocument();
  });

  it('should render the correct number of applications', () => {
    render(<ApplicationStatus applications={applications} formatDate={formatDateMock} />);
    expect(screen.getByText('2 applications')).toBeInTheDocument();
  });

  it('should render the "Join Interview" link if meetLink is provided', () => {
    render(<ApplicationStatus applications={applications} formatDate={formatDateMock} />);
    expect(screen.getByText('Join Interview')).toBeInTheDocument();
  });

  it('should render the "Download CV", "View Passport", and "View Photo" links if the URLs are provided', () => {
    render(<ApplicationStatus applications={applications} formatDate={formatDateMock} />);
    expect(screen.getAllByText('Download CV').length).toBe(2);
    expect(screen.getAllByText('View Passport').length).toBe(2);
    expect(screen.getByText('View Photo')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentsAndLinksCard from '../DocumentsAndLinksCard';
import '@testing-library/jest-dom';

describe('DocumentsAndLinksCard', () => {
  const candidate = {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    status: 'submitted',
    cvUrl: 'http://example.com/cv.pdf',
    passportUrl: 'http://example.com/passport.pdf',
    submittedAt: { toDate: () => new Date() },
  };

  it('should render the "View CV/Resume" and "View ID/Passport" links', () => {
    render(<DocumentsAndLinksCard candidate={candidate} />);
    expect(screen.getByText('View CV/Resume')).toBeInTheDocument();
    expect(screen.getByText('View ID/Passport')).toBeInTheDocument();
  });

  it('should render the "View Photo" link if photoUrl is provided', () => {
    const candidateWithPhoto = { ...candidate, photoUrl: 'http://example.com/photo.jpg' };
    render(<DocumentsAndLinksCard candidate={candidateWithPhoto} />);
    expect(screen.getByText('View Photo')).toBeInTheDocument();
  });

  it('should not render the "View Photo" link if photoUrl is not provided', () => {
    render(<DocumentsAndLinksCard candidate={candidate} />);
    expect(screen.queryByText('View Photo')).not.toBeInTheDocument();
  });

  it('should render the website links if websites are provided', () => {
    const candidateWithWebsites = { ...candidate, websites: ['http://example.com', 'http://anotherexample.com'] };
    render(<DocumentsAndLinksCard candidate={candidateWithWebsites} />);
    expect(screen.getByText('http://example.com')).toBeInTheDocument();
    expect(screen.getByText('http://anotherexample.com')).toBeInTheDocument();
  });

  it('should not render the website links if websites are not provided', () => {
    render(<DocumentsAndLinksCard candidate={candidate} />);
    expect(screen.queryByText('http://example.com')).not.toBeInTheDocument();
  });
});

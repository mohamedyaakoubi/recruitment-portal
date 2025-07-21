
import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';
import '@testing-library/jest-dom';

describe('StatusBadge', () => {
  it('should render correctly for "submitted" status', () => {
    render(<StatusBadge status="submitted" />);
    const badge = screen.getByText('Application Submitted');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
  });

  it('should render correctly for "interview_scheduled" status', () => {
    render(<StatusBadge status="interview_scheduled" />);
    const badge = screen.getByText('Interview Scheduled');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('should render correctly for "approved" status', () => {
    render(<StatusBadge status="approved" />);
    const badge = screen.getByText('Approved');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
  });

  it('should render correctly for "rejected" status', () => {
    render(<StatusBadge status="rejected" />);
    const badge = screen.getByText('Rejected');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100');
  });

  it('should render correctly for a default status', () => {
    render(<StatusBadge status="custom_status" />);
    const badge = screen.getByText('custom_status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
  });
});

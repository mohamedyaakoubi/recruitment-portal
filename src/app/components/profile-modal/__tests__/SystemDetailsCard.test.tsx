
import React from 'react';
import { render, screen } from '@testing-library/react';
import SystemDetailsCard from '../SystemDetailsCard';
import '@testing-library/jest-dom';

describe('SystemDetailsCard', () => {
  const candidate = {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    status: 'submitted',
    calendarEventId: 'event123',
    meetSpaceId: 'meet123',
    submittedAt: { toDate: () => new Date() },
  };

  it('should render the system details correctly', () => {
    render(<SystemDetailsCard candidate={candidate} />);
    expect(screen.getByText('System Details')).toBeInTheDocument();
    expect(screen.getByText(/Calendar Event ID/)).toBeInTheDocument();
    expect(screen.getByText('event123')).toBeInTheDocument();
    expect(screen.getByText(/Meet Space ID/)).toBeInTheDocument();
    expect(screen.getByText('meet123')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardHeader from '../DashboardHeader';

describe('DashboardHeader', () => {
  const onManageJobsClick = jest.fn();
  const onSignOut = jest.fn();

  const defaultProps = {
    userEmail: 'test@example.com',
    onManageJobsClick,
    onSignOut,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the welcome message with the user email', () => {
    render(<DashboardHeader {...defaultProps} />);
    expect(screen.getByText('Welcome back, test@example.com')).toBeInTheDocument();
  });

  it('calls onManageJobsClick when the "Manage Jobs" button is clicked', () => {
    render(<DashboardHeader {...defaultProps} />);
    const manageJobsButton = screen.getByText('Manage Jobs');
    fireEvent.click(manageJobsButton);
    expect(onManageJobsClick).toHaveBeenCalledTimes(1);
  });

  it('calls onSignOut when the "Sign Out" button is clicked', () => {
    render(<DashboardHeader {...defaultProps} />);
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
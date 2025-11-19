
import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeSection from '../WelcomeSection';
import '@testing-library/jest-dom';

describe('WelcomeSection', () => {
  const handleNewApplicationMock = vi.fn();

  const defaultProps = {
    candidateEmail: 'test@example.com',
    handleNewApplication: handleNewApplicationMock,
  };

  beforeEach(() => {
    handleNewApplicationMock.mockClear();
  });

  it("should render the welcome message with the candidate's email", () => {
    render(<WelcomeSection {...defaultProps} />);
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    expect(screen.getByText(/Manage your applications for/)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should call handleNewApplication when the "Submit New Application" button is clicked', () => {
    render(<WelcomeSection {...defaultProps} />);
    fireEvent.click(screen.getByText('Submit New Application'));
    expect(handleNewApplicationMock).toHaveBeenCalledTimes(1);
  });
});

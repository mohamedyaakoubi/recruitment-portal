
import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditModalFooter from '../EditModalFooter';
import '@testing-library/jest-dom';

describe('EditModalFooter', () => {
  const onCloseMock = vi.fn();
  const handleSubmitMock = vi.fn();

  const defaultProps = {
    onClose: onCloseMock,
    handleSubmit: handleSubmitMock,
    isLoading: false,
    loadingJobs: false,
  };

  beforeEach(() => {
    onCloseMock.mockClear();
    handleSubmitMock.mockClear();
  });

  it('should render the "Cancel" and "Save Changes" buttons', () => {
    render(<EditModalFooter {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('should call onClose when the "Cancel" button is clicked', () => {
    render(<EditModalFooter {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should call handleSubmit when the "Save Changes" button is clicked', () => {
    render(<EditModalFooter {...defaultProps} />);
    fireEvent.click(screen.getByText('Save Changes'));
    expect(handleSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('should disable the buttons and show "Saving..." when isLoading is true', () => {
    render(<EditModalFooter {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Saving...').closest('button')).toBeDisabled();
  });

  it('should disable the "Save Changes" button when loadingJobs is true', () => {
    render(<EditModalFooter {...defaultProps} loadingJobs={true} />);
    expect(screen.getByText('Save Changes').closest('button')).toBeDisabled();
  });
});

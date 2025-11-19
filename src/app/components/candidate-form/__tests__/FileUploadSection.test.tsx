import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FileUploadSection from '../FileUploadSection';
import '@testing-library/jest-dom';

vi.mock('../../ui/FileInput', () => ({
    __esModule: true,
    default: ({ label, name, disabled }: any) => (
        <input type="file" data-testid={name} aria-label={label} disabled={disabled} />
    ),
}));

describe('FileUploadSection', () => {
  const handleFileChangeMock = vi.fn();

  const defaultProps = {
    handleFileChange: handleFileChangeMock,
    isLoading: false,
    isExistingCandidate: false,
  };

  it('should render the file inputs for CV, passport, and photo', () => {
    render(<FileUploadSection {...defaultProps} />);
    expect(screen.getByLabelText('CV/Resume')).toBeInTheDocument();
    expect(screen.getByLabelText('Passport/ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Professional Photo')).toBeInTheDocument();
  });

  it('should show a message for existing candidates', () => {
    render(<FileUploadSection {...defaultProps} isExistingCandidate={true} />);
    expect(screen.getByText('(Please upload fresh copies of your documents)')).toBeInTheDocument();
  });

  it('should disable the file inputs when isLoading is true', () => {
    render(<FileUploadSection {...defaultProps} isLoading={true} />);
    expect(screen.getByLabelText('CV/Resume')).toBeDisabled();
    expect(screen.getByLabelText('Passport/ID')).toBeDisabled();
    expect(screen.getByLabelText('Professional Photo')).toBeDisabled();
  });
});
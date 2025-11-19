
import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobInfoForm from '../JobInfoForm';
import '@testing-library/jest-dom';

describe('JobInfoForm', () => {
  const handleCategoryChangeMock = vi.fn();
  const handleJobChangeMock = vi.fn();
  const handleInputChangeMock = vi.fn();

  const defaultProps = {
    formData: {
      jobCategory: 'IT',
      jobTitle: 'job1',
      specialty: 'Frontend',
      jobTitleText: 'Software Engineer',
    },
    jobCategories: ['IT', 'Finance'],
    filteredJobs: [{ id: 'job1', title: 'Software Engineer' }],
    availableSpecialties: ['Frontend', 'Backend'],
    handleCategoryChange: handleCategoryChangeMock,
    handleJobChange: handleJobChangeMock,
    handleInputChange: handleInputChangeMock,
    isLoading: false,
    loadingJobs: false,
  };

  beforeEach(() => {
    handleCategoryChangeMock.mockClear();
    handleJobChangeMock.mockClear();
    handleInputChangeMock.mockClear();
  });

  it('should render the form with the correct initial values', () => {
    render(<JobInfoForm {...defaultProps} />);
    expect(screen.getByLabelText('Job Category')).toHaveValue('IT');
    expect(screen.getByLabelText('Job Position')).toHaveValue('job1');
    expect(screen.getByLabelText('Specialty')).toHaveValue('Frontend');
    expect(screen.getByLabelText('Current Job Title')).toHaveValue('Software Engineer');
  });

  it('should call handleCategoryChange when the job category is changed', () => {
    let capturedValue = '';
    handleCategoryChangeMock.mockImplementation((e) => {
      capturedValue = e.target.value;
    });
    render(<JobInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Job Category'), { target: { value: 'Finance' } });
    expect(handleCategoryChangeMock).toHaveBeenCalled();
    expect(capturedValue).toBe('Finance');
  });

  it('should call handleJobChange when the job position is changed', () => {
    let capturedValue = '';
    handleJobChangeMock.mockImplementation((e) => {
      capturedValue = e.target.value;
    });
    render(<JobInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Job Position'), { target: { value: 'job1' } });
    expect(handleJobChangeMock).toHaveBeenCalled();
    expect(capturedValue).toBe('job1');
  });

  it('should call handleInputChange when the specialty is changed', () => {
    let capturedValue = '';
    handleInputChangeMock.mockImplementation((e) => {
      capturedValue = e.target.value;
    });
    render(<JobInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Specialty'), { target: { value: 'Backend' } });
    expect(handleInputChangeMock).toHaveBeenCalled();
    expect(capturedValue).toBe('Backend');
  });

  it('should show a loading indicator when loadingJobs is true', () => {
    render(<JobInfoForm {...defaultProps} loadingJobs={true} />);
    expect(screen.getByText('Loading jobs...')).toBeInTheDocument();
  });

  it('should disable the form fields when isLoading is true', () => {
    render(<JobInfoForm {...defaultProps} isLoading={true} />);
    expect(screen.getByLabelText('Job Category')).toBeDisabled();
    expect(screen.getByLabelText('Job Position')).toBeDisabled();
    expect(screen.getByLabelText('Specialty')).toBeDisabled();
  });

  it('should show a message when no jobs are available for a category', () => {
    render(<JobInfoForm {...defaultProps} filteredJobs={[]} />);
    expect(screen.getByText('No active jobs available in this category')).toBeInTheDocument();
  });

  it('should show a message when no specialties are available for a job', () => {
    render(<JobInfoForm {...defaultProps} availableSpecialties={[]} />);
    expect(screen.getByText('No specialties available for this job')).toBeInTheDocument();
  });
});


import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobApplicationSection from '../JobApplicationSection';
import '@testing-library/jest-dom';

describe('JobApplicationSection', () => {
  const handleCategorySelectionMock = vi.fn();
  const handleJobSelectionMock = vi.fn();
  const setSpecialtyMock = vi.fn();
  const setSpecialtySearchMock = vi.fn();

  const defaultProps = {
    selectedCategory: 'Development & IT',
    handleCategorySelection: handleCategorySelectionMock,
    jobTitle: 'job1',
    handleJobSelection: handleJobSelectionMock,
    filteredJobs: [{ id: 'job1', title: 'Software Engineer', description: 'Job description', category: 'Development & IT' }],
    selectedJob: { id: 'job1', title: 'Software Engineer', description: 'Job description', category: 'Development & IT' },
    specialty: 'Frontend',
    setSpecialty: setSpecialtyMock,
    specialtySearch: 'Frontend',
    setSpecialtySearch: setSpecialtySearchMock,
    availableSpecialties: ['Frontend', 'Backend'],
    isLoading: false,
  };

  beforeEach(() => {
    handleCategorySelectionMock.mockClear();
    handleJobSelectionMock.mockClear();
    setSpecialtyMock.mockClear();
    setSpecialtySearchMock.mockClear();
  });

  it('should render the form with the correct initial values', () => {
    render(<JobApplicationSection {...defaultProps} />);
    expect(screen.getByLabelText(/Job Category/)).toHaveValue('Development & IT');
    expect(screen.getByLabelText(/Job Position/)).toHaveValue('job1');
    expect(screen.getByLabelText(/Specialty/)).toHaveValue('Frontend');
  });

  it('should call handleCategorySelection when the job category is changed', () => {
    render(<JobApplicationSection {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Job Category/), { target: { value: 'Finance' } });
    expect(handleCategorySelectionMock).toHaveBeenCalled();
  });

  it('should call handleJobSelection when the job position is changed', () => {
    render(<JobApplicationSection {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Job Position/), { target: { value: 'job1' } });
    expect(handleJobSelectionMock).toHaveBeenCalled();
  });

  it('should call setSpecialty and setSpecialtySearch when the specialty is changed', () => {
    render(<JobApplicationSection {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Specialty/), { target: { value: 'Backend' } });
    expect(setSpecialtySearchMock).toHaveBeenCalledWith('Backend');
  });

  it('should show the job description when a job is selected', () => {
    render(<JobApplicationSection {...defaultProps} />);
    expect(screen.getByText('Job description')).toBeInTheDocument();
  });

  it('should show the available specialties when a job is selected', () => {
    render(<JobApplicationSection {...defaultProps} />);
    expect(screen.getByText('Available Specialties:')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('should show a message when no specialties are available', () => {
    render(<JobApplicationSection {...defaultProps} availableSpecialties={[]} />);
    expect(screen.getByText('No specialties defined for this job position. Please contact admin.')).toBeInTheDocument();
  });

  it('should disable the form fields when isLoading is true', () => {
    render(<JobApplicationSection {...defaultProps} isLoading={true} />);
    expect(screen.getByLabelText(/Job Category/)).toBeDisabled();
    expect(screen.getByLabelText(/Job Position/)).toBeDisabled();
    expect(screen.getByLabelText(/Specialty/)).toBeDisabled();
  });
});

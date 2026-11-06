import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import EditCandidateModal from '../EditCandidateModal';
import type { Candidate } from '@/types';

// Mock the hook
vi.mock('@/hooks/useEditCandidateForm', () => ({
  useEditCandidateForm: vi.fn(() => ({
    formData: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      city: 'New York',
      country: 'USA',
      nationality: 'American',
      age: 30,
      category: 'Engineering',
      specialty: 'Software',
      jobTitle: 'Developer',
    },
    errors: {},
    jobCategories: ['Engineering', 'Design'],
    loadingJobs: false,
    availableSpecialties: ['Software', 'Hardware'],
    filteredJobs: [
      { id: 'job1', title: 'Developer', category: 'Engineering' },
      { id: 'job2', title: 'Designer', category: 'Design' },
    ],
    handleInputChange: vi.fn(),
    handleCategoryChange: vi.fn(),
    handleJobChange: vi.fn(),
    handleSubmit: vi.fn((e) => e?.preventDefault()),
  })),
}));

// Mock child components
vi.mock('../edit-candidate-modal/EditModalHeader', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="edit-modal-header">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../edit-candidate-modal/EditModalFooter', () => ({
  default: ({ handleSubmit }: { handleSubmit: () => void }) => (
    <div data-testid="edit-modal-footer">
      <button onClick={handleSubmit}>Save</button>
    </div>
  ),
}));

vi.mock('../edit-candidate-modal/EditCandidateForm', () => ({
  default: ({ formData }: { formData: Record<string, unknown> }) => (
    <div data-testid="edit-candidate-form">
      <span>{formData.firstName}</span>
      <span>{formData.lastName}</span>
    </div>
  ),
}));

describe('EditCandidateModal', () => {
  const mockCandidate: Candidate = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    city: 'New York',
    country: 'USA',
    nationality: 'American',
    age: 30,
    category: 'Engineering',
    specialty: 'Software',
    jobTitle: 'Developer',
    status: 'submitted',
    submittedAt: new Date('2024-01-01').toISOString(),
  };

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when open with candidate', () => {
    render(
      <EditCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        candidate={mockCandidate}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('edit-modal-header')).toBeInTheDocument();
    expect(screen.getByTestId('edit-candidate-form')).toBeInTheDocument();
    expect(screen.getByTestId('edit-modal-footer')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <EditCandidateModal
        isOpen={false}
        onClose={mockOnClose}
        candidate={mockCandidate}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should not render when candidate is null', () => {
    render(
      <EditCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        candidate={null}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(
      <EditCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        candidate={mockCandidate}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'edit-modal-title');
  });

  it('should call onClose when close button is clicked', async () => {
    render(
      <EditCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        candidate={mockCandidate}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should display candidate data in form', () => {
    render(
      <EditCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        candidate={mockCandidate}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
  });
});

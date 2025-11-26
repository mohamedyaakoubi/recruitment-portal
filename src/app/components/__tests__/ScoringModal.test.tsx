import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScoringModal from '../ScoringModal';
import { Candidate, Job } from '@/types';

// Mock the fetch API
global.fetch = vi.fn();

describe('ScoringModal', () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn();

  const mockCandidate: Candidate = {
    id: '1',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
  };

  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Software Engineer',
      description: 'Develop amazing things',
      category: 'IT',
      specialties: ['Frontend'],
      isActive: true,
    },
    {
      id: '2',
      title: 'Data Scientist',
      description: 'Analyze data',
      category: 'Data',
      specialties: ['Machine Learning'],
      isActive: true,
    },
  ];

  beforeEach(() => {
    (fetch as vi.Mock).mockClear();
    vi.clearAllMocks();
  });

  it('renders the modal with the candidate name', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobs: mockJobs }),
    });

    render(
      <ScoringModal
        isOpen={true}
        onClose={onClose}
        candidate={mockCandidate}
        onSubmit={onSubmit}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Score Candidate: John Doe')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Software Engineer')).toBeInTheDocument());
  });

  it('shows the job description when a job is selected', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobs: mockJobs }),
    });

    render(
      <ScoringModal
        isOpen={true}
        onClose={onClose}
        candidate={mockCandidate}
        onSubmit={onSubmit}
        isLoading={false}
        error={null}
      />
    );

    const select = await screen.findByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    await waitFor(() => expect(screen.getByText('Develop amazing things')).toBeInTheDocument());
  });

  it('calls onSubmit with the correct job details when the form is submitted', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobs: mockJobs }),
    });

    render(
      <ScoringModal
        isOpen={true}
        onClose={onClose}
        candidate={mockCandidate}
        onSubmit={onSubmit}
        isLoading={false}
        error={null}
      />
    );

    const select = await screen.findByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    const submitButton = screen.getByText('Score Candidate');
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith('1', 'Software Engineer', 'Develop amazing things')
    );
  });
});

import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobManagement from '../JobManagement';
import { Job } from '@/types';

// Mock the fetch API
global.fetch = vi.fn();
// Mock console.error
console.error = vi.fn();

describe('JobManagement', () => {
  const onClose = vi.fn();

  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Software Engineer',
      description: 'Develop amazing things',
      category: 'IT',
      specialties: ['Frontend'],
      isActive: true,
      createdAt: { toDate: () => new Date() },
    },
    {
      id: '2',
      title: 'Data Scientist',
      description: 'Analyze data',
      category: 'Data',
      specialties: ['Machine Learning'],
      isActive: false,
      createdAt: { toDate: () => new Date() },
    },
  ];

  beforeEach(() => {
    (fetch as vi.Mock).mockClear();
    (console.error as vi.Mock).mockClear();
    vi.clearAllMocks();
  });

  it('renders the component when open', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobs: mockJobs }),
    });

    render(<JobManagement isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Job Management')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Software Engineer')).toBeInTheDocument());
  });

  it('renders the "Add New Job" button', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobs: [] }),
    });

    render(<JobManagement isOpen={true} onClose={onClose} />);

    expect(await screen.findByTestId('add-job-button')).toBeInTheDocument();
  });

  it('handles error when fetching jobs', async () => {
    (fetch as vi.Mock).mockRejectedValueOnce(new Error('Failed to fetch jobs'));

    render(<JobManagement isOpen={true} onClose={onClose} />);

    await waitFor(() => expect(screen.getByText('Failed to fetch jobs')).toBeInTheDocument());
  });
});

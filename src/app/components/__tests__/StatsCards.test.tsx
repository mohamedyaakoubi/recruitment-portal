import React from 'react';
import { render, screen, within } from '@testing-library/react';
import StatsCards from '../StatsCards';
import { Stats, Candidate } from '@/types';

describe('StatsCards', () => {
  const mockStats: Stats = {
    total: 10,
    submitted: 8,
    scheduled: 5,
    approved: 3,
    rejected: 2,
  };

  const mockCandidates: Candidate[] = [
    { id: '1', name: 'Alice', score: 85, status: 'approved' },
    { id: '2', name: 'Bob', score: 75, status: 'scheduled' },
    { id: '3', name: 'Charlie', score: 90, status: 'approved' },
    { id: '4', name: 'David', score: null, status: 'submitted' },
  ];

  it('renders the main stats cards correctly', () => {
    render(<StatsCards stats={mockStats} candidates={mockCandidates} />);

    const totalCandidatesCard = screen.getByText('Total Candidates').closest('div');
    expect(within(totalCandidatesCard).getByText('10')).toBeInTheDocument();

    const submittedCard = screen.getByText('Submitted').closest('div');
    expect(within(submittedCard).getByText('8')).toBeInTheDocument();

    const scheduledCard = screen.getByText('Interview Scheduled').closest('div');
    expect(within(scheduledCard).getByText('5')).toBeInTheDocument();

    const rejectedCard = screen.getByText('Rejected').closest('div');
    expect(within(rejectedCard).getByText('2')).toBeInTheDocument();
  });

  it('calculates and renders the secondary stats correctly', () => {
    render(<StatsCards stats={mockStats} candidates={mockCandidates} />);

    const averageScoreCard = screen.getByText('Average AI Score').closest('div');
    expect(within(averageScoreCard).getByText('83.3')).toBeInTheDocument();

    const highScorersCard = screen.getByText('High Scorers (80+)').closest('div');
    expect(within(highScorersCard).getByText('2')).toBeInTheDocument();

    const conversionRateCard = screen.getByText('Conversion Rate').closest('div');
    expect(within(conversionRateCard).getByText('62.5%')).toBeInTheDocument();

    const interviewSuccessCard = screen.getByText('Interview Success').closest('div');
    expect(within(interviewSuccessCard).getByText('60.0%')).toBeInTheDocument();
  });
});

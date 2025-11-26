import React from 'react';
import { render, screen } from '@testing-library/react';
import ScoringCard from '../ScoringCard';
import '@testing-library/jest-dom';

describe('ScoringCard', () => {
  const candidate = {
    id: '1',
    fullName: 'Test User',
    email: 'test@example.com',
    status: 'submitted',
    score: 85,
    aiRecommendation: 'highly_recommended',
    scoreAnalysis: 'This is a great candidate.',
    keyStrengths: ['React', 'TypeScript'],
    areasForImprovement: ['Testing'],
    scoringVersion: '1.0',
    lastScoredAt: { toDate: () => new Date('2023-01-01') },
    submittedAt: { toDate: () => new Date() },
  };

  it('should not render if the candidate score is null or undefined', () => {
    const { container } = render(<ScoringCard candidate={{ ...candidate, score: null }} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the AI score and recommendation', () => {
    render(<ScoringCard candidate={candidate} />);
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Highly Recommended')).toBeInTheDocument();
  });

  it('should render the analysis if provided', () => {
    render(<ScoringCard candidate={candidate} />);
    expect(screen.getByText('This is a great candidate.')).toBeInTheDocument();
  });

  it('should render the key strengths if provided', () => {
    render(<ScoringCard candidate={candidate} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('should render the areas for improvement if provided', () => {
    render(<ScoringCard candidate={candidate} />);
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });

  it('should render the metadata if provided', () => {
    render(<ScoringCard candidate={candidate} />);
    expect(screen.getByText(/Analyzed:/)).toBeInTheDocument();
    expect(screen.getByText('1.0')).toBeInTheDocument();
  });

  it('should display the correct recommendation text and color for "recommended"', () => {
    render(<ScoringCard candidate={{ ...candidate, aiRecommendation: 'recommended' }} />);
    const recommendation = screen.getByText('Recommended');
    expect(recommendation).toBeInTheDocument();
    expect(recommendation.parentElement).toHaveClass('text-blue-600');
  });

  it('should display the correct recommendation text and color for "conditional"', () => {
    render(<ScoringCard candidate={{ ...candidate, aiRecommendation: 'conditional' }} />);
    const recommendation = screen.getByText('Conditional');
    expect(recommendation).toBeInTheDocument();
    expect(recommendation.parentElement).toHaveClass('text-yellow-600');
  });

  it('should display the correct recommendation text and color for "not_recommended"', () => {
    render(<ScoringCard candidate={{ ...candidate, aiRecommendation: 'not_recommended' }} />);
    const recommendation = screen.getByText('Not Recommended');
    expect(recommendation).toBeInTheDocument();
    expect(recommendation.parentElement).toHaveClass('text-red-600');
  });
});

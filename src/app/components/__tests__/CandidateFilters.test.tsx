import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CandidateFilters from '../CandidateFilters';
import { createMockCandidate } from '@/__tests__/utils/factories';

// Mock candidates data for testing
const mockCandidates = [
  createMockCandidate({
    id: '1',
    fullName: 'Alice Smith',
    city: 'New York',
    country: 'USA',
    nationality: 'American',
    jobTitleText: 'Software Engineer',
    jobCategory: 'IT',
    specialty: 'Frontend',
    age: 28,
    status: 'submitted',
  }),
  createMockCandidate({
    id: '2',
    fullName: 'Bob Johnson',
    city: 'London',
    country: 'UK',
    nationality: 'British',
    jobTitleText: 'Data Scientist',
    jobCategory: 'Data',
    specialty: 'Machine Learning',
    age: 35,
    status: 'interview_scheduled',
  }),
];

describe('CandidateFilters', () => {
  // Mock functions for filter change handlers
  const onFilterStatusChange = vi.fn();
  const onFilterNameChange = vi.fn();
  const onFilterCityChange = vi.fn();
  const onFilterCountryChange = vi.fn();
  const onFilterNationalityChange = vi.fn();
  const onFilterJobTitleChange = vi.fn();
  const onFilterCategoryChange = vi.fn();
  const onFilterSpecialtyChange = vi.fn();
  const onFilterAgeMinChange = vi.fn();
  const onFilterAgeMaxChange = vi.fn();
  const onClearAllFilters = vi.fn();

  const defaultProps = {
    candidates: mockCandidates,
    filterStatus: 'all',
    filterName: '',
    filterCity: '',
    filterCountry: '',
    filterNationality: '',
    filterJobTitle: '',
    filterCategory: '',
    filterSpecialty: '',
    filterAgeMin: '',
    filterAgeMax: '',
    onFilterStatusChange,
    onFilterNameChange,
    onFilterCityChange,
    onFilterCountryChange,
    onFilterNationalityChange,
    onFilterJobTitleChange,
    onFilterCategoryChange,
    onFilterSpecialtyChange,
    onFilterAgeMinChange,
    onFilterAgeMaxChange,
    onClearAllFilters,
  };

  beforeEach(() => {
    // Clear mock function calls before each test
    vi.clearAllMocks();
  });

  it('renders all filter inputs correctly', () => {
    render(<CandidateFilters {...defaultProps} />);

    // Check for main filter inputs
    expect(screen.getByPlaceholderText('Filter by name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search and select city...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search and select country...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search and select nationality...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search and select category...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search and select specialty...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search and select job title...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min age...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max age...')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Status')).toBeInTheDocument();

    // Check for quick filter buttons
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Popular Specialties:')).toBeInTheDocument();
    expect(screen.getByText('Nationalities:')).toBeInTheDocument();
    expect(screen.getByText('Popular Cities:')).toBeInTheDocument();
    expect(screen.getByText('Popular Countries:')).toBeInTheDocument();
    expect(screen.getByText('Job Categories:')).toBeInTheDocument();
    expect(screen.getByText('Job Positions:')).toBeInTheDocument();
  });

  it('calls onFilterNameChange when typing in the name filter', () => {
    render(<CandidateFilters {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText('Filter by name...');
    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    expect(onFilterNameChange).toHaveBeenCalledWith('Alice');
  });

  it('calls onClearAllFilters when the "Clear All Filters" button is clicked', () => {
    render(<CandidateFilters {...defaultProps} />);
    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);
    expect(onClearAllFilters).toHaveBeenCalledTimes(1);
  });

  it('calls onFilterStatusChange when a status quick filter is clicked', () => {
    render(<CandidateFilters {...defaultProps} />);
    const submittedButton = screen.getByRole('button', { name: /submitted/i });
    fireEvent.click(submittedButton);
    expect(onFilterStatusChange).toHaveBeenCalledWith('submitted');
  });
});

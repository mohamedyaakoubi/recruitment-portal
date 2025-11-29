/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import type { Candidate } from '@/types';
import { Timestamp } from 'firebase/firestore';

const mockCandidates: Candidate[] = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
    dateOfBirth: '1990-01-01',
    nationality: 'US',
    gender: 'Male',
    city: 'New York',
    country: 'USA',
    jobCategory: 'Healthcare',
    jobTitleText: 'Nurse',
    status: 'submitted',
    submittedAt: { toMillis: () => Date.now() } as unknown as Timestamp,
    cvUrl: '',
    passportUrl: '',
    websites: [],
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    phoneNumber: '+0987654321',
    dateOfBirth: '1985-02-02',
    nationality: 'UK',
    gender: 'Female',
    city: 'London',
    country: 'UK',
    jobCategory: 'Engineering',
    jobTitleText: 'Software Engineer',
    status: 'approved',
    submittedAt: { toMillis: () => Date.now() } as unknown as Timestamp,
    cvUrl: '',
    passportUrl: '',
    websites: [],
  },
  {
    id: '3',
    fullName: 'Bob Johnson',
    email: 'bob@example.com',
    phoneNumber: '+1122334455',
    dateOfBirth: '1995-03-03',
    nationality: 'CA',
    gender: 'Male',
    city: 'Toronto',
    country: 'Canada',
    jobCategory: 'Healthcare',
    jobTitleText: 'Doctor',
    specialty: 'Cardiology',
    status: 'rejected',
    submittedAt: { toMillis: () => Date.now() } as unknown as Timestamp,
    cvUrl: '',
    passportUrl: '',
    websites: [],
  },
];

describe('useDashboardFilters', () => {
  it('should initialize with default filter values', () => {
    const { result } = renderHook(() => useDashboardFilters(mockCandidates, 'main'));

    expect(result.current.filterStatus).toBe('all');
    expect(result.current.filterName).toBe('');
    expect(result.current.filterCity).toBe('');
    expect(result.current.filterCountry).toBe('');
    expect(result.current.filterNationality).toBe('');
    expect(result.current.filterJobTitle).toBe('');
    expect(result.current.filterCategory).toBe('');
    expect(result.current.filterSpecialty).toBe('');
    expect(result.current.filterAgeMin).toBe('');
    expect(result.current.filterAgeMax).toBe('');
  });

  it('should return all candidates when no filters are applied', () => {
    const { result } = renderHook(() => useDashboardFilters(mockCandidates, 'main'));

    // Main tab shows submitted and interview_scheduled
    expect(result.current.filteredCandidates).toHaveLength(1);
    expect(result.current.filteredCandidates[0]?.fullName).toBe('John Doe');
  });

  it('should filter candidates by name', () => {
    const { result } = renderHook(() => useDashboardFilters(mockCandidates, 'main'));

    act(() => {
      result.current.setFilterName('jane');
    });

    expect(result.current.filteredCandidates).toHaveLength(0); // Jane is approved, not in main tab
  });

  it('should filter candidates by status', () => {
    const { result } = renderHook(() => useDashboardFilters(mockCandidates, 'main'));

    act(() => {
      result.current.setFilterStatus('submitted');
    });

    expect(result.current.filteredCandidates).toHaveLength(1);
    expect(result.current.filteredCandidates[0]?.status).toBe('submitted');
  });

  it('should filter candidates by city', () => {
    const { result } = renderHook(() => useDashboardFilters(mockCandidates, 'main'));

    act(() => {
      result.current.setFilterCity('New York');
    });

    expect(result.current.filteredCandidates).toHaveLength(1);
    expect(result.current.filteredCandidates[0]?.city).toBe('New York');
  });

  it('should filter candidates by specialty', () => {
    const { result } = renderHook(() => useDashboardFilters(mockCandidates, 'rejected'));

    act(() => {
      result.current.setFilterSpecialty('cardio');
    });

    expect(result.current.filteredCandidates).toHaveLength(1);
    expect(result.current.filteredCandidates[0]?.specialty).toBe('Cardiology');
  });

  it('should filter by age range', () => {
    const { result } = renderHook(() => useDashboardFilters(mockCandidates, 'approved'));

    act(() => {
      result.current.setFilterAgeMin('30');
      result.current.setFilterAgeMax('45');
    });

    // Jane Smith born in 1985, should be ~40 years old
    expect(result.current.filteredCandidates).toHaveLength(1);
    expect(result.current.filteredCandidates[0]?.fullName).toBe('Jane Smith');
  });

  it('should respect tab filtering', () => {
    const { result: mainResult } = renderHook(() => useDashboardFilters(mockCandidates, 'main'));
    const { result: approvedResult } = renderHook(() =>
      useDashboardFilters(mockCandidates, 'approved')
    );
    const { result: rejectedResult } = renderHook(() =>
      useDashboardFilters(mockCandidates, 'rejected')
    );

    expect(mainResult.current.filteredCandidates).toHaveLength(1); // John Doe (submitted)
    expect(approvedResult.current.filteredCandidates).toHaveLength(1); // Jane Smith
    expect(rejectedResult.current.filteredCandidates).toHaveLength(1); // Bob Johnson
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useDashboardFilters(mockCandidates, 'main'));

    act(() => {
      result.current.setFilterName('test');
      result.current.setFilterCity('test');
      result.current.setFilterStatus('submitted');
      result.current.clearAllFilters();
    });

    expect(result.current.filterName).toBe('');
    expect(result.current.filterCity).toBe('');
    expect(result.current.filterStatus).toBe('all');
  });
});

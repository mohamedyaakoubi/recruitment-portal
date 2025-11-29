/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardModals } from '@/hooks/useDashboardModals';
import type { Candidate } from '@/types';
import { Timestamp } from 'firebase/firestore';

const mockCandidate: Candidate = {
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
};

describe('useDashboardModals', () => {
  it('should initialize with all modals closed', () => {
    const { result } = renderHook(() => useDashboardModals());

    expect(result.current.isScoringModalOpen).toBe(false);
    expect(result.current.isProfileModalOpen).toBe(false);
    expect(result.current.isJobManagementOpen).toBe(false);
    expect(result.current.isInterviewSchedulingOpen).toBe(false);
    expect(result.current.selectedCandidate).toBeNull();
  });

  it('should open and close scoring modal', () => {
    const { result } = renderHook(() => useDashboardModals());

    act(() => {
      result.current.openScoringModal(mockCandidate);
    });

    expect(result.current.isScoringModalOpen).toBe(true);
    expect(result.current.selectedCandidate).toEqual(mockCandidate);

    act(() => {
      result.current.closeScoringModal();
    });

    expect(result.current.isScoringModalOpen).toBe(false);
    expect(result.current.selectedCandidate).toBeNull();
    expect(result.current.scoringError).toBeNull();
  });

  it('should open and close profile modal', () => {
    const { result } = renderHook(() => useDashboardModals());

    act(() => {
      result.current.openProfileModal(mockCandidate);
    });

    expect(result.current.isProfileModalOpen).toBe(true);
    expect(result.current.selectedCandidate).toEqual(mockCandidate);

    act(() => {
      result.current.closeProfileModal();
    });

    expect(result.current.isProfileModalOpen).toBe(false);
    expect(result.current.selectedCandidate).toBeNull();
  });

  it('should open and close job management modal', () => {
    const { result } = renderHook(() => useDashboardModals());

    act(() => {
      result.current.openJobManagement();
    });

    expect(result.current.isJobManagementOpen).toBe(true);

    act(() => {
      result.current.closeJobManagement();
    });

    expect(result.current.isJobManagementOpen).toBe(false);
  });

  it('should manage loading states', () => {
    const { result } = renderHook(() => useDashboardModals());

    act(() => {
      result.current.setIsScoring(true);
      result.current.setIsScheduling(true);
    });

    expect(result.current.isScoring).toBe(true);
    expect(result.current.isScheduling).toBe(true);

    act(() => {
      result.current.setIsScoring(false);
      result.current.setIsScheduling(false);
    });

    expect(result.current.isScoring).toBe(false);
    expect(result.current.isScheduling).toBe(false);
  });

  it('should manage confirmation modal state', () => {
    const { result } = renderHook(() => useDashboardModals());
    const mockOnConfirm = vi.fn();

    act(() => {
      result.current.setConfirmationModal({
        isOpen: true,
        title: 'Confirm Action',
        message: 'Are you sure?',
        onConfirm: mockOnConfirm,
      });
    });

    expect(result.current.confirmationModal).toEqual({
      isOpen: true,
      title: 'Confirm Action',
      message: 'Are you sure?',
      onConfirm: mockOnConfirm,
    });

    act(() => {
      result.current.setConfirmationModal(null);
    });

    expect(result.current.confirmationModal).toBeNull();
  });
});

import { vi } from 'vitest';

import { renderHook, act } from '@testing-library/react';
import { useProfileModal } from '../useProfileModal';
import { Candidate } from '@/types';

const mockCandidate: Candidate = {
  id: 'cand1',
  fullName: 'Test Candidate',
  dateOfBirth: '1990-01-01',
  email: '',
  status: 'submitted',
  score: 0,
  scoreAnalysis: '',
  interviewDate: undefined,
  calendarEventId: '',
  meetLink: '',
  duration: 0,
  phone: '',
  availability: [],
  city: '',
  country: '',
  linkedin: '',
  github: '',
  resume: '',
  coverLetter: '',
  jobTitle: '',
  jobCategory: '',
  yearsOfExperience: 0,
  skills: [],
  referral: '',
  source: '',
  startDate: '',
  comments: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('useProfileModal', () => {
  const onEditCandidate = vi.fn();

  beforeEach(() => {
    onEditCandidate.mockClear();
  });

  it('should manage the edit modal state', () => {
    const { result } = renderHook(() => useProfileModal(mockCandidate, onEditCandidate));
    expect(result.current.isEditModalOpen).toBe(false);
    act(() => {
      result.current.setIsEditModalOpen(true);
    });
    expect(result.current.isEditModalOpen).toBe(true);
  });

  it('should call onEditCandidate and manage updating state', async () => {
    onEditCandidate.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProfileModal(mockCandidate, onEditCandidate));

    const updatedData = { firstName: 'Updated' };

    let promise;
    act(() => {
      promise = result.current.handleEditCandidate(mockCandidate.id, updatedData);
    });

    expect(result.current.isUpdating).toBe(true);
    expect(onEditCandidate).toHaveBeenCalledWith(mockCandidate.id, updatedData);

    await act(async () => {
      await promise;
    });

    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isEditModalOpen).toBe(false);
  });

  it('should handle errors during candidate update', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorMessage = 'Update failed';
    onEditCandidate.mockRejectedValue(new Error(errorMessage));
    const { result } = renderHook(() => useProfileModal(mockCandidate, onEditCandidate));

    await act(async () => {
      await result.current.handleEditCandidate(mockCandidate.id, {});
    });

    expect(result.current.isUpdating).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Failed to update candidate');
    consoleErrorSpy.mockRestore();
  });

  it('should not do anything if onEditCandidate is not provided', async () => {
    const { result } = renderHook(() => useProfileModal(mockCandidate));
    await act(async () => {
      await result.current.handleEditCandidate(mockCandidate.id, {});
    });
    expect(onEditCandidate).not.toHaveBeenCalled();
  });

  it('should calculate age correctly', () => {
    const { result } = renderHook(() => useProfileModal(mockCandidate));
    const age = result.current.calculateAge('1990-01-01');
    const expectedAge =
      new Date().getFullYear() -
      1990 -
      (new Date().getMonth() < 0 || (new Date().getMonth() === 0 && new Date().getDate() < 1)
        ? 1
        : 0);
    expect(age).toBe(expectedAge);
  });

  it('should return null for invalid date of birth', () => {
    const { result } = renderHook(() => useProfileModal(mockCandidate));
    expect(result.current.calculateAge('invalid-date')).toBeNull();
    expect(result.current.calculateAge('')).toBeNull();
  });
});

import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardState } from '../useDashboardState';

describe('useDashboardState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDashboardState());

    expect(result.current.activeTab).toBe('main');
    expect(result.current.filterStatus).toBe('all');
    expect(result.current.filterName).toBe('');
    expect(result.current.isScoringModalOpen).toBe(false);
    expect(result.current.selectedCandidate).toBeNull();
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useDashboardState());

    act(() => {
      result.current.setFilterName('John Doe');
      result.current.setFilterStatus('submitted');
    });

    expect(result.current.filterName).toBe('John Doe');
    expect(result.current.filterStatus).toBe('submitted');

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.filterName).toBe('');
    expect(result.current.filterStatus).toBe('all');
  });

  it('should show and hide toast', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDashboardState());

    act(() => {
      result.current.showToast('Test message', 'success');
    });

    expect(result.current.toast.isVisible).toBe(true);
    expect(result.current.toast.message).toBe('Test message');
    expect(result.current.toast.type).toBe('success');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toast.isVisible).toBe(false);
  });
});

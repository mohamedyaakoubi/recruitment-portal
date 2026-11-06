/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardToast } from '@/hooks/useDashboardToast';

describe('useDashboardToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with toast hidden', () => {
    const { result } = renderHook(() => useDashboardToast());

    expect(result.current.toast.isVisible).toBe(false);
    expect(result.current.toast.message).toBe('');
    expect(result.current.toast.type).toBe('info');
  });

  it('should show toast with correct message and type', () => {
    const { result } = renderHook(() => useDashboardToast());

    act(() => {
      result.current.showToast('Test message', 'success');
    });

    expect(result.current.toast.isVisible).toBe(true);
    expect(result.current.toast.message).toBe('Test message');
    expect(result.current.toast.type).toBe('success');
  });

  it('should hide toast after 5 seconds', () => {
    const { result } = renderHook(() => useDashboardToast());

    act(() => {
      result.current.showToast('Test message', 'error');
    });

    expect(result.current.toast.isVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toast.isVisible).toBe(false);
  });

  it('should support different toast types', () => {
    const { result } = renderHook(() => useDashboardToast());

    const types: Array<'success' | 'error' | 'warning' | 'info'> = [
      'success',
      'error',
      'warning',
      'info',
    ];

    types.forEach((type) => {
      act(() => {
        result.current.showToast(`${type} message`, type);
      });

      expect(result.current.toast.type).toBe(type);
      expect(result.current.toast.message).toBe(`${type} message`);
    });
  });

  it('should allow manual toast state updates', () => {
    const { result } = renderHook(() => useDashboardToast());

    act(() => {
      result.current.setToast({
        message: 'Manual message',
        type: 'warning',
        isVisible: true,
      });
    });

    expect(result.current.toast.message).toBe('Manual message');
    expect(result.current.toast.type).toBe('warning');
    expect(result.current.toast.isVisible).toBe(true);
  });
});

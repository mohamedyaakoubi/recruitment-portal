import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SuccessToast from '../SuccessToast';
import '@testing-library/jest-dom';

vi.useFakeTimers();

describe('SuccessToast', () => {
  const onCloseMock = vi.fn();

  const defaultProps = {
    message: 'Test Message',
    isVisible: true,
    onClose: onCloseMock,
    duration: 3000,
  };

  beforeEach(() => {
    onCloseMock.mockClear();
  });

  it('should not render when isVisible is false', () => {
    render(<SuccessToast {...defaultProps} isVisible={false} />);
    expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
  });

  it('should render correctly with the provided message when isVisible is true', () => {
    render(<SuccessToast {...defaultProps} />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByText('Application Submitted!')).toBeInTheDocument();
  });

  it('should call onClose after the duration', () => {
    render(<SuccessToast {...defaultProps} />);
    act(() => {
      vi.advanceTimersByTime(3300);
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the close button is clicked', () => {
    render(<SuccessToast {...defaultProps} />);
    fireEvent.click(screen.getByText(/Close/));
    act(() => {
        vi.advanceTimersByTime(300); // for fade out animation
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from '../Toast';
import '@testing-library/jest-dom';

jest.useFakeTimers();

describe('Toast', () => {
  const onCloseMock = jest.fn();

  const defaultProps = {
    message: 'Test Message',
    type: 'success' as const,
    isVisible: true,
    onClose: onCloseMock,
    duration: 3000,
  };

  beforeEach(() => {
    onCloseMock.mockClear();
  });

  it('should not render when isVisible is false', () => {
    render(<Toast {...defaultProps} isVisible={false} />);
    expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
  });

  it('should render correctly with the provided message and type', () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should call onClose after the duration', () => {
    render(<Toast {...defaultProps} />);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the close button is clicked', () => {
    render(<Toast {...defaultProps} />);
    fireEvent.click(screen.getByText('✕'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should render correct styles for success type', () => {
    render(<Toast {...defaultProps} type="success" />);
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('bg-green-500');
  });

  it('should render correct styles for error type', () => {
    render(<Toast {...defaultProps} type="error" />);
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('bg-red-500');
  });

  it('should render correct styles for warning type', () => {
    render(<Toast {...defaultProps} type="warning" />);
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('bg-yellow-500');
  });

  it('should render correct styles for info type', () => {
    render(<Toast {...defaultProps} type="info" />);
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('bg-blue-500');
  });
});
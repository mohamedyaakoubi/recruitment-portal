
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationModal from '../ConfirmationModal';
import '@testing-library/jest-dom';

describe('ConfirmationModal', () => {
  const onConfirmMock = jest.fn();
  const onCancelMock = jest.fn();

  const defaultProps = {
    isOpen: true,
    title: 'Test Title',
    message: 'Test Message',
    onConfirm: onConfirmMock,
    onCancel: onCancelMock,
  };

  beforeEach(() => {
    onConfirmMock.mockClear();
    onCancelMock.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should render correctly with title and message when isOpen is true', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should call onConfirm when the confirm button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when the cancel button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('should display correct styles for danger type', () => {
    render(<ConfirmationModal {...defaultProps} type="danger" />);
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-red-600');
  });

  it('should display correct styles for warning type', () => {
    render(<ConfirmationModal {...defaultProps} type="warning" />);
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-yellow-600');
  });

  it('should display correct styles for info type', () => {
    render(<ConfirmationModal {...defaultProps} type="info" />);
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-blue-600');
  });
});

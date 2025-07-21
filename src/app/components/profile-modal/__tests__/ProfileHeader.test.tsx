
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileHeader from '../ProfileHeader';
import '@testing-library/jest-dom';

describe('ProfileHeader', () => {
  const onEditMock = jest.fn();
  const onCloseMock = jest.fn();

  const candidate = {
    id: '1',
    fullName: 'Test User',
    jobTitleText: 'Software Engineer',
    photoUrl: 'http://example.com/photo.jpg',
    status: 'submitted',
    submittedAt: { toDate: () => new Date() },
  };

  const defaultProps = {
    candidate,
    onEdit: onEditMock,
    onClose: onCloseMock,
    isUpdating: false,
    statusUpdateLoading: false,
  };

  beforeEach(() => {
    onEditMock.mockClear();
    onCloseMock.mockClear();
  });

  it("should render the candidate's full name and job title", () => {
    render(<ProfileHeader {...defaultProps} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it("should render the candidate's photo if photoUrl is provided", () => {
    render(<ProfileHeader {...defaultProps} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'http://example.com/photo.jpg');
  });

  it('should render a placeholder icon if photoUrl is not provided', () => {
    const candidateWithoutPhoto = { ...candidate, photoUrl: undefined };
    render(<ProfileHeader {...defaultProps} candidate={candidateWithoutPhoto} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should call onEdit when the "Edit" button is clicked', () => {
    render(<ProfileHeader {...defaultProps} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the close button is clicked', () => {
    render(<ProfileHeader {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should disable the "Edit" button when isUpdating is true', () => {
    render(<ProfileHeader {...defaultProps} isUpdating={true} />);
    expect(screen.getByText('Edit').closest('button')).toBeDisabled();
  });

  it('should disable the "Edit" button when statusUpdateLoading is true', () => {
    render(<ProfileHeader {...defaultProps} statusUpdateLoading={true} />);
    expect(screen.getByText('Edit').closest('button')).toBeDisabled();
  });
});

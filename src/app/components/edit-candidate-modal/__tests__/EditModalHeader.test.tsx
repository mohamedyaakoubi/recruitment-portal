
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditModalHeader from '../EditModalHeader';
import '@testing-library/jest-dom';

describe('EditModalHeader', () => {
  const onCloseMock = jest.fn();

  const defaultProps = {
    onClose: onCloseMock,
    isLoading: false,
  };

  beforeEach(() => {
    onCloseMock.mockClear();
  });

  it('should render the title and subtitle', () => {
    render(<EditModalHeader {...defaultProps} />);
    expect(screen.getByText('Edit Candidate Information')).toBeInTheDocument();
    expect(screen.getByText('Update candidate details')).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    render(<EditModalHeader {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should disable the close button when isLoading is true', () => {
    render(<EditModalHeader {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

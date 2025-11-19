import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdditionalInfoSection from '../AdditionalInfoSection';
import '@testing-library/jest-dom';

describe('AdditionalInfoSection', () => {
  const addAdditionalInfoMock = vi.fn();
  const removeAdditionalInfoMock = vi.fn();
  const updateAdditionalInfoMock = vi.fn();

  const defaultProps = {
    additionalInfo: [
      { type: 'link' as const, content: 'http://example.com' },
      { type: 'text' as const, content: 'Some text' },
    ],
    addAdditionalInfo: addAdditionalInfoMock,
    removeAdditionalInfo: removeAdditionalInfoMock,
    updateAdditionalInfo: updateAdditionalInfoMock,
    isLoading: false,
  };

  beforeEach(() => {
    addAdditionalInfoMock.mockClear();
    removeAdditionalInfoMock.mockClear();
    updateAdditionalInfoMock.mockClear();
  });

  it('should render the "Add Link", "Add File", and "Add Text" buttons', () => {
    render(<AdditionalInfoSection {...defaultProps} />);
    expect(screen.getByText('Add Link')).toBeInTheDocument();
    expect(screen.getByText('Add File')).toBeInTheDocument();
    expect(screen.getByText('Add Text')).toBeInTheDocument();
  });

  it('should call addAdditionalInfo with the correct type when each button is clicked', () => {
    render(<AdditionalInfoSection {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Link'));
    expect(addAdditionalInfoMock).toHaveBeenCalledWith('link');
    fireEvent.click(screen.getByText('Add File'));
    expect(addAdditionalInfoMock).toHaveBeenCalledWith('file');
    fireEvent.click(screen.getByText('Add Text'));
    expect(addAdditionalInfoMock).toHaveBeenCalledWith('text');
  });

  it('should render the correct input field based on the type of the additional info', () => {
    render(<AdditionalInfoSection {...defaultProps} />);
    expect(screen.getByDisplayValue('http://example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Some text')).toBeInTheDocument();
  });

  it('should call updateAdditionalInfo when the input value is changed', () => {
    render(<AdditionalInfoSection {...defaultProps} />);
    fireEvent.change(screen.getByDisplayValue('http://example.com'), { target: { value: 'http://new.com' } });
    expect(updateAdditionalInfoMock).toHaveBeenCalledWith(0, 'http://new.com');
  });

  it('should call removeAdditionalInfo when the remove button is clicked', () => {
    render(<AdditionalInfoSection {...defaultProps} />);
    const removeButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(removeButtons[0]);
    expect(removeAdditionalInfoMock).toHaveBeenCalledWith(0);
  });

  it('should not show the remove button if there is only one item', () => {
    render(<AdditionalInfoSection {...defaultProps} additionalInfo={[{ type: 'link', content: '' }]} />);
    expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument();
  });

  it('should disable the form fields and buttons when isLoading is true', () => {
    render(<AdditionalInfoSection {...defaultProps} isLoading={true} />);
    expect(screen.getByDisplayValue('http://example.com')).toBeDisabled();
    expect(screen.getByDisplayValue('Some text')).toBeDisabled();
    expect(screen.getByText('Add Link').closest('button')).toBeDisabled();
    expect(screen.getByText('Add File').closest('button')).toBeDisabled();
    expect(screen.getByText('Add Text').closest('button')).toBeDisabled();
  });
});
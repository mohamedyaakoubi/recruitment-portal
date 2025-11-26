import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LocationInfoForm from '../LocationInfoForm';
import '@testing-library/jest-dom';

vi.mock('../../ui/SearchableDropdown', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder, id, disabled }: any) => (
    <input
      data-testid={placeholder}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  ),
}));

describe('LocationInfoForm', () => {
  const handleInputChangeMock = vi.fn();

  const defaultProps = {
    formData: {
      city: 'Test City',
      country: 'Test Country',
      nationality: 'Test Nationality',
      doubleNationality: 'Test Second Nationality',
    },
    errors: {},
    handleInputChange: handleInputChangeMock,
    isLoading: false,
  };

  beforeEach(() => {
    handleInputChangeMock.mockClear();
  });

  it('should render the form with the correct initial values', () => {
    render(<LocationInfoForm {...defaultProps} />);
    expect(screen.getByLabelText(/^City/)).toHaveValue('Test City');
    expect(screen.getByLabelText(/^Country/)).toHaveValue('Test Country');
    expect(screen.getByLabelText(/^Nationality/)).toHaveValue('Test Nationality');
    expect(screen.getByLabelText(/Second Nationality/)).toHaveValue('Test Second Nationality');
  });

  it('should call handleInputChange when the city is changed', () => {
    let capturedValue = '';
    handleInputChangeMock.mockImplementation((e) => {
      capturedValue = e.target.value;
    });
    render(<LocationInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/^City/), { target: { value: 'New City' } });
    expect(handleInputChangeMock).toHaveBeenCalled();
    expect(capturedValue).toBe('New City');
  });

  it('should call handleInputChange when the country is changed', () => {
    let capturedValue = '';
    handleInputChangeMock.mockImplementation((e) => {
      capturedValue = e.target.value;
    });
    render(<LocationInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/^Country/), { target: { value: 'New Country' } });
    expect(handleInputChangeMock).toHaveBeenCalled();
    expect(capturedValue).toBe('New Country');
  });

  it('should call handleInputChange when the nationality is changed', () => {
    let capturedValue = '';
    handleInputChangeMock.mockImplementation((e) => {
      capturedValue = e.target.value;
    });
    render(<LocationInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/^Nationality/), {
      target: { value: 'New Nationality' },
    });
    expect(handleInputChangeMock).toHaveBeenCalled();
    expect(capturedValue).toBe('New Nationality');
  });

  it('should call handleInputChange when the second nationality is changed', () => {
    let capturedValue = '';
    handleInputChangeMock.mockImplementation((e) => {
      capturedValue = e.target.value;
    });
    render(<LocationInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Second Nationality/), {
      target: { value: 'New Second Nationality' },
    });
    expect(handleInputChangeMock).toHaveBeenCalled();
    expect(capturedValue).toBe('New Second Nationality');
  });

  it('should display error messages when there are errors', () => {
    const errors = {
      city: 'City is required',
      country: 'Country is required',
      nationality: 'Nationality is required',
    };
    render(<LocationInfoForm {...defaultProps} errors={errors} />);
    expect(screen.getByText('City is required')).toBeInTheDocument();
    expect(screen.getByText('Country is required')).toBeInTheDocument();
    expect(screen.getByText('Nationality is required')).toBeInTheDocument();
  });

  it('should disable the form fields when isLoading is true', () => {
    render(<LocationInfoForm {...defaultProps} isLoading={true} />);
    expect(screen.getByLabelText(/^City/)).toBeDisabled();
    expect(screen.getByLabelText(/^Country/)).toBeDisabled();
    expect(screen.getByLabelText(/^Nationality/)).toBeDisabled();
    expect(screen.getByLabelText(/Second Nationality/)).toBeDisabled();
  });
});

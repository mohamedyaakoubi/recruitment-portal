import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonalInfoForm from '../PersonalInfoForm';
import '@testing-library/jest-dom';

describe('PersonalInfoForm', () => {
  const handleInputChangeMock = jest.fn();

  const defaultProps = {
    formData: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      gender: 'male',
      dateOfBirth: '1990-01-01',
      countryCode: '+1',
      phoneNumber: '1234567890',
    },
    errors: {},
    handleInputChange: handleInputChangeMock,
    isLoading: false,
  };

  beforeEach(() => {
    handleInputChangeMock.mockClear();
  });

  it('should render the form with the correct initial values', () => {
    render(<PersonalInfoForm {...defaultProps} />);
    expect(screen.getByLabelText(/First Name/)).toHaveValue('Test');
    expect(screen.getByLabelText(/Last Name/)).toHaveValue('User');
    expect(screen.getByLabelText(/Email/)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/Gender/)).toHaveValue('male');
    expect(screen.getByLabelText(/Date of Birth/)).toHaveValue('1990-01-01');
    expect(screen.getByLabelText(/Phone Number/)).toHaveValue('1234567890');
    expect(screen.getByLabelText('Country Code')).toHaveValue('+1');
  });

  it('should call handleInputChange when the first name is changed', () => {
    render(<PersonalInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: 'New' } });
    expect(handleInputChangeMock).toHaveBeenCalledWith('firstName', 'New');
  });

  it('should call handleInputChange when the last name is changed', () => {
    render(<PersonalInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Last Name/), { target: { value: 'Name' } });
    expect(handleInputChangeMock).toHaveBeenCalledWith('lastName', 'Name');
  });

  it('should call handleInputChange when the email is changed', () => {
    render(<PersonalInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'new@example.com' } });
    expect(handleInputChangeMock).toHaveBeenCalledWith('email', 'new@example.com');
  });

  it('should call handleInputChange when the gender is changed', () => {
    render(<PersonalInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Gender/), { target: { value: 'female' } });
    expect(handleInputChangeMock).toHaveBeenCalledWith('gender', 'female');
  });

  it('should call handleInputChange when the date of birth is changed', () => {
    render(<PersonalInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Date of Birth/), { target: { value: '1991-01-01' } });
    expect(handleInputChangeMock).toHaveBeenCalledWith('dateOfBirth', '1991-01-01');
  });

  it('should call handleInputChange when the country code is changed', () => {
    render(<PersonalInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Country Code'), { target: { value: '+44' } });
    expect(handleInputChangeMock).toHaveBeenCalledWith('countryCode', '+44');
  });

  it('should call handleInputChange when the phone number is changed', () => {
    render(<PersonalInfoForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: '0987654321' } });
    expect(handleInputChangeMock).toHaveBeenCalledWith('phoneNumber', '0987654321');
  });

  it('should display error messages when there are errors', () => {
    const errors = {
      firstName: 'First name is required',
      lastName: 'Last name is required',
      email: 'Email is required',
      gender: 'Gender is required',
      dateOfBirth: 'Date of birth is required',
      phoneNumber: 'Phone number is required',
    };
    render(<PersonalInfoForm {...defaultProps} errors={errors} />);
    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Gender is required')).toBeInTheDocument();
    expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
    expect(screen.getByText('Phone number is required')).toBeInTheDocument();
  });

  it('should disable the form fields when isLoading is true', () => {
    render(<PersonalInfoForm {...defaultProps} isLoading={true} />);
    expect(screen.getByLabelText(/First Name/)).toBeDisabled();
    expect(screen.getByLabelText(/Last Name/)).toBeDisabled();
    expect(screen.getByLabelText(/Email/)).toBeDisabled();
    expect(screen.getByLabelText(/Gender/)).toBeDisabled();
    expect(screen.getByLabelText(/Date of Birth/)).toBeDisabled();
    expect(screen.getByLabelText(/Phone Number/)).toBeDisabled();
    expect(screen.getByLabelText('Country Code')).toBeDisabled();
  });
});
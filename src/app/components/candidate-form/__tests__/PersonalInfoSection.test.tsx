
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonalInfoSection from '../PersonalInfoSection';
import '@testing-library/jest-dom';

jest.mock('../../ui/SearchableDropdown', () => ({
    __esModule: true,
    default: ({ value, onChange, placeholder, disabled }: any) => (
        <input
            data-testid={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
        />
    ),
}));

describe('PersonalInfoSection', () => {
  const setFirstNameMock = jest.fn();
  const setLastNameMock = jest.fn();
  const setGenderMock = jest.fn();
  const setDateOfBirthMock = jest.fn();
  const setCountryCodeMock = jest.fn();
  const setPhoneNumberMock = jest.fn();
  const setCityMock = jest.fn();
  const setCountryMock = jest.fn();
  const setNationalityMock = jest.fn();
  const setDoubleNationalityMock = jest.fn();
  const calculateAgeMock = jest.fn(() => 33);

  const defaultProps = {
    firstName: 'Test',
    setFirstName: setFirstNameMock,
    lastName: 'User',
    setLastName: setLastNameMock,
    email: 'test@example.com',
    gender: 'male',
    setGender: setGenderMock,
    dateOfBirth: '1990-01-01',
    setDateOfBirth: setDateOfBirthMock,
    countryCode: '+1',
    setCountryCode: setCountryCodeMock,
    phoneNumber: '1234567890',
    setPhoneNumber: setPhoneNumberMock,
    city: 'Test City',
    setCity: setCityMock,
    country: 'Test Country',
    setCountry: setCountryMock,
    nationality: 'Test Nationality',
    setNationality: setNationalityMock,
    doubleNationality: 'Test Second Nationality',
    setDoubleNationality: setDoubleNationalityMock,
    isLoading: false,
    isExistingCandidate: false,
    calculateAge: calculateAgeMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form with the correct initial values', () => {
    render(<PersonalInfoSection {...defaultProps} />);
    expect(screen.getByLabelText(/First Name/)).toHaveValue('Test');
    expect(screen.getByLabelText(/Last Name/)).toHaveValue('User');
    expect(screen.getByLabelText(/Email Address/)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/Gender/)).toHaveValue('male');
    expect(screen.getByLabelText(/Date of Birth/)).toHaveValue('1990-01-01');
    expect(screen.getByLabelText(/Phone Number/)).toHaveValue('1234567890');
    expect(screen.getByLabelText(/City/)).toHaveValue('Test City');
    expect(screen.getByPlaceholderText('Search and select your country')).toHaveValue('Test Country');
    expect(screen.getByPlaceholderText('Search and select your nationality')).toHaveValue('Test Nationality');
    expect(screen.getByPlaceholderText('Search and select second nationality')).toHaveValue('Test Second Nationality');
  });

  it('should call the setter functions when the input values are changed', () => {
    render(<PersonalInfoSection {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: 'New' } });
    expect(setFirstNameMock).toHaveBeenCalledWith('New');
    fireEvent.change(screen.getByLabelText(/Last Name/), { target: { value: 'Name' } });
    expect(setLastNameMock).toHaveBeenCalledWith('Name');
    fireEvent.change(screen.getByLabelText(/Gender/), { target: { value: 'female' } });
    expect(setGenderMock).toHaveBeenCalledWith('female');
    fireEvent.change(screen.getByLabelText(/Date of Birth/), { target: { value: '1991-01-01' } });
    expect(setDateOfBirthMock).toHaveBeenCalledWith('1991-01-01');
    fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: '0987654321' } });
    expect(setPhoneNumberMock).toHaveBeenCalledWith('0987654321');
    fireEvent.change(screen.getByLabelText(/City/), { target: { value: 'New City' } });
    expect(setCityMock).toHaveBeenCalledWith('New City');
    fireEvent.change(screen.getByPlaceholderText('Search and select your country'), { target: { value: 'New Country' } });
    expect(setCountryMock).toHaveBeenCalledWith('New Country');
    fireEvent.change(screen.getByPlaceholderText('Search and select your nationality'), { target: { value: 'New Nationality' } });
    expect(setNationalityMock).toHaveBeenCalledWith('New Nationality');
    fireEvent.change(screen.getByPlaceholderText('Search and select second nationality'), { target: { value: 'New Second Nationality' } });
    expect(setDoubleNationalityMock).toHaveBeenCalledWith('New Second Nationality');
  });

  it('should disable the form fields when isLoading is true', () => {
    render(<PersonalInfoSection {...defaultProps} isLoading={true} />);
    expect(screen.getByLabelText(/First Name/)).toBeDisabled();
    expect(screen.getByLabelText(/Last Name/)).toBeDisabled();
    expect(screen.getByLabelText(/Gender/)).toBeDisabled();
    expect(screen.getByLabelText(/Date of Birth/)).toBeDisabled();
    expect(screen.getByLabelText(/Phone Number/)).toBeDisabled();
    expect(screen.getByLabelText(/City/)).toBeDisabled();
    expect(screen.getByPlaceholderText('Search and select your country')).toBeDisabled();
    expect(screen.getByPlaceholderText('Search and select your nationality')).toBeDisabled();
    expect(screen.getByPlaceholderText('Search and select second nationality')).toBeDisabled();
  });

  it('should disable the name, gender, and date of birth fields when isExistingCandidate is true', () => {
    render(<PersonalInfoSection {...defaultProps} isExistingCandidate={true} />);
    expect(screen.getByLabelText(/First Name/)).toBeDisabled();
    expect(screen.getByLabelText(/Last Name/)).toBeDisabled();
    expect(screen.getByLabelText(/Gender/)).toBeDisabled();
    expect(screen.getByLabelText(/Date of Birth/)).toBeDisabled();
  });

  it('should show the age requirement notice', () => {
    render(<PersonalInfoSection {...defaultProps} />);
    expect(screen.getByText('Age Requirement')).toBeInTheDocument();
  });

  it('should show the calculated age and validation message', () => {
    render(<PersonalInfoSection {...defaultProps} />);
    expect(screen.getByText(/Age: 33 years old/)).toBeInTheDocument();
  });
});

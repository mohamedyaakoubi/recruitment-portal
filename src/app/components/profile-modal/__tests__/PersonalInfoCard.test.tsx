import React from 'react';
import { render, screen } from '@testing-library/react';
import PersonalInfoCard from '../PersonalInfoCard';
import '@testing-library/jest-dom';

describe('PersonalInfoCard', () => {
  const candidate = {
    id: '1',
    fullName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    gender: 'male',
    countryCode: '+1',
    phoneNumber: '1234567890',
    city: 'Test City',
    country: 'Test Country',
    nationality: 'Test Nationality',
    dateOfBirth: '1990-01-01',
    status: 'submitted',
    submittedAt: { toDate: () => new Date() },
  };

  it('should render the personal information correctly', () => {
    render(<PersonalInfoCard candidate={candidate} age={33} />);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText(/First Name/)).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText(/Last Name/)).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText(/Gender/)).toBeInTheDocument();
    expect(screen.getByText('male')).toBeInTheDocument();
    expect(screen.getByText(/Email/)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Phone/)).toBeInTheDocument();
    expect(screen.getByText('+1 1234567890')).toBeInTheDocument();
    expect(screen.getByText(/Location/)).toBeInTheDocument();
    expect(screen.getByText('Test City, Test Country')).toBeInTheDocument();
    expect(screen.getByText(/^Nationality/)).toBeInTheDocument();
    expect(screen.getByText('Test Nationality')).toBeInTheDocument();
    expect(screen.getByText(/Date of Birth/)).toBeInTheDocument();
    expect(screen.getByText('1990-01-01 (33 years)')).toBeInTheDocument();
  });

  it('should render the second nationality if provided', () => {
    const candidateWithSecondNationality = { ...candidate, doubleNationality: 'Test Second Nationality' };
    render(<PersonalInfoCard candidate={candidateWithSecondNationality} age={33} />);
    expect(screen.getByText(/2nd Nationality/)).toBeInTheDocument();
    expect(screen.getByText('Test Second Nationality')).toBeInTheDocument();
  });

  it('should not render the second nationality if not provided', () => {
    render(<PersonalInfoCard candidate={candidate} age={33} />);
    expect(screen.queryByText(/2nd Nationality/)).not.toBeInTheDocument();
  });

  it('should render the age if dateOfBirth is provided', () => {
    render(<PersonalInfoCard candidate={candidate} age={33} />);
    expect(screen.getByText('1990-01-01 (33 years)')).toBeInTheDocument();
  });

  it('should not render the age if dateOfBirth is not provided', () => {
    const candidateWithoutDob = { ...candidate, dateOfBirth: undefined };
    render(<PersonalInfoCard candidate={candidateWithoutDob} age={null} />);
    expect(screen.queryByText(/years/)).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import DebugInfo from '../DebugInfo';
import '@testing-library/jest-dom';

describe('DebugInfo', () => {
  const defaultProps = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    gender: 'male',
    countryCode: '+1',
    phoneNumber: '1234567890',
    dateOfBirth: '1990-01-01',
    city: 'Test City',
    country: 'Test Country',
    nationality: 'Test Nationality',
    selectedCategory: 'IT',
    jobTitle: 'Software Engineer',
    specialty: 'Frontend',
    availableSpecialties: ['Frontend', 'Backend'],
    cvFile: new File(['cv'], 'cv.pdf', { type: 'application/pdf' }),
    passportFile: new File(['passport'], 'passport.pdf', { type: 'application/pdf' }),
    photoFile: null,
    calculateAge: () => 33,
  };

  it('should not render in a production environment', () => {
    process.env.NODE_ENV = 'production';
    const { container } = render(<DebugInfo {...defaultProps} />);
    expect(container.firstChild).toBeNull();
    process.env.NODE_ENV = 'test'; // Reset for other tests
  });

  it('should render the debug information in a development environment', () => {
    process.env.NODE_ENV = 'development';
    render(<DebugInfo {...defaultProps} />);
    expect(screen.getByText('Debug Information:')).toBeInTheDocument();
    expect(screen.getByText(/First Name:/)).toBeInTheDocument();
    expect(screen.getByText(/"Test"/)).toBeInTheDocument();
    process.env.NODE_ENV = 'test'; // Reset for other tests
  });
});

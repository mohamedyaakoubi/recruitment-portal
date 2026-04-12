import React from 'react';
import { render, screen } from '@testing-library/react';
import HelpSection from '../HelpSection';
import '@testing-library/jest-dom';

describe('HelpSection', () => {
  it('should render the "Need Help?" title', () => {
    render(<HelpSection />);
    expect(screen.getByText('Need Help?')).toBeInTheDocument();
  });

  it('should render the email and phone number when env vars are set', () => {
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL = 'support@example.com';
    process.env.NEXT_PUBLIC_CONTACT_PHONE = '+1 555 000 0000';
    render(<HelpSection />);
    expect(screen.getByText('support@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 555 000 0000')).toBeInTheDocument();
    delete process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
    delete process.env.NEXT_PUBLIC_CONTACT_PHONE;
  });
});

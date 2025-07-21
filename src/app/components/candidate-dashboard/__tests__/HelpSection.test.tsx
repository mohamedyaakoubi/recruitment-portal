
import React from 'react';
import { render, screen } from '@testing-library/react';
import HelpSection from '../HelpSection';
import '@testing-library/jest-dom';

describe('HelpSection', () => {
  it('should render the "Need Help?" title', () => {
    render(<HelpSection />);
    expect(screen.getByText('Need Help?')).toBeInTheDocument();
  });

  it('should render the email and phone number', () => {
    render(<HelpSection />);
    expect(screen.getByText('wassim@internationalskills.fi')).toBeInTheDocument();
    expect(screen.getByText('+358 452644966')).toBeInTheDocument();
  });
});


import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';
import '@testing-library/jest-dom';

describe('Footer', () => {
  it('should render the contact information', () => {
    render(<Footer />);
    expect(screen.getByText('wassim@internationalskills.fi')).toBeInTheDocument();
    expect(screen.getByText('+358 452644966')).toBeInTheDocument();
    expect(screen.getByText('+216 29 581 180')).toBeInTheDocument();
  });

  it('should render the social media links', () => {
    render(<Footer />);
    const socialLinks = screen.getAllByRole('link');
    expect(socialLinks.length).toBe(3);
    expect(socialLinks[0]).toHaveAttribute('href', 'https://www.linkedin.com/company/international-skills-labor-company/');
    expect(socialLinks[1]).toHaveAttribute('href', 'https://www.facebook.com/profile.php?id=61571369068485');
    expect(socialLinks[2]).toHaveAttribute('href', 'https://www.instagram.com/internationalskillscompany?igsh=MTI4enh4ODNzOGN5Mw%3D%3D');
  });

  it('should render the copyright notice', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2025 Wassim Abbessi. All Rights Reserved./)).toBeInTheDocument();
  });
});

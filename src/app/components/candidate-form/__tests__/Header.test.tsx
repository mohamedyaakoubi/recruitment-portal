
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';
import '@testing-library/jest-dom';

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}));

describe('Header', () => {
  it('should render the logo', () => {
    render(<Header />);
    const logo = screen.getByAltText('International Skills Labor Company');
    expect(logo).toBeInTheDocument();
  });

  it('should render the ThemeSwitcher component', () => {
    render(<Header />);
    const themeSwitcher = screen.getByRole('button', { name: /Toggle theme/i });
    expect(themeSwitcher).toBeInTheDocument();
  });

  it('should render the contact information in the top bar', () => {
    render(<Header />);
    expect(screen.getByText('+358 452644966')).toBeInTheDocument();
    expect(screen.getByText('wassim@internationalskills.fi')).toBeInTheDocument();
  });
});

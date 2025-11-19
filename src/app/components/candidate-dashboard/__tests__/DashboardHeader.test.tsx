
import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardHeader from '../DashboardHeader';
import '@testing-library/jest-dom';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}));

describe('DashboardHeader', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('should render the logo', () => {
    render(<DashboardHeader />);
    const logo = screen.getByAltText('International Skills Labor Company');
    expect(logo).toBeInTheDocument();
  });

  it('should render the "Back to Home" button and call router.push when clicked', () => {
    render(<DashboardHeader />);
    const backButton = screen.getByText('← Back to Home');
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should render the ThemeSwitcher component', () => {
    render(<DashboardHeader />);
    // We can't easily test for the ThemeSwitcher component itself,
    // but we can test for an element that we know is inside it.
    // Or, we can just check if the button to toggle the theme is there.
    // For this case, let's assume the ThemeSwitcher renders a button.
    const themeSwitcher = screen.getByRole('button', { name: /Toggle theme/i });
    expect(themeSwitcher).toBeInTheDocument();
  });

  it('should render the contact information in the top bar', () => {
    render(<DashboardHeader />);
    expect(screen.getByText('+358 452644966')).toBeInTheDocument();
    expect(screen.getByText('wassim@internationalskills.fi')).toBeInTheDocument();
  });
});

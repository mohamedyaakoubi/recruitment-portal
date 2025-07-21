import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useTheme } from 'next-themes';

// Mock the useTheme hook
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeSwitcher', () => {
  it('renders correctly and toggles theme on click', () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light', setTheme });

    render(<ThemeSwitcher />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});

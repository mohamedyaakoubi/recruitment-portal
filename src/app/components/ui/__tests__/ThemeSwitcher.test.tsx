import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useTheme } from 'next-themes';

// Mock the useTheme hook
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

describe('ThemeSwitcher', () => {
  it('renders correctly and toggles theme on click', () => {
    const setTheme = vi.fn();
    (useTheme as any).mockReturnValue({ theme: 'light', setTheme });

    render(<ThemeSwitcher />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});

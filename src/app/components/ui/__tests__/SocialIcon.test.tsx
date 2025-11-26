import React from 'react';
import { render, screen } from '@testing-library/react';
import SocialIcon from '../SocialIcon';
import '@testing-library/jest-dom';

describe('SocialIcon', () => {
  it('should render correctly with the provided href and children', () => {
    render(
      <SocialIcon href="https://example.com">
        <span>Icon</span>
      </SocialIcon>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });
});

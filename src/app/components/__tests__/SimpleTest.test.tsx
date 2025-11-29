import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Absolute Simplest Test', () => {
  it('should render a simple div', async () => {
    const { container } = render(<div data-testid="test">Hello World</div>);

    const element = await screen.findByTestId('test');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello World');
  });
});

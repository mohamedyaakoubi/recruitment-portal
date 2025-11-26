import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Vitest Simple Test', () => {
  it('should render a simple component', () => {
    const { container } = render(<div data-testid="test">Hello from Vitest!</div>);
    console.log('Container HTML:', container.innerHTML);

    const element = screen.getByTestId('test');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello from Vitest!');
  });
});

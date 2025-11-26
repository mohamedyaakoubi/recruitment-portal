import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Absolute Simplest Test', () => {
  it('should render a simple div', async () => {
    const { container } = render(<div data-testid="test">Hello World</div>);
    console.log('Container HTML:', container.innerHTML);
    console.log('Container outerHTML:', container.outerHTML);
    console.log('Document body:', document.body.innerHTML);

    const element = await screen.findByTestId('test');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello World');
  });
});

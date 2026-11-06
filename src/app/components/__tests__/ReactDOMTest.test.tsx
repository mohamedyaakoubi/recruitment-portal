/**
 * @jest-environment jsdom
 */
import React from 'react';
import ReactDOM from 'react-dom/client';

describe('React Render Test', () => {
  it('should render React element using ReactDOM', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(React.createElement('div', { 'data-testid': 'test' }, 'Hello from React'));

    // Wait a bit for rendering
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Container HTML after render:', container.innerHTML);
        console.log('Container outerHTML:', container.outerHTML);

        const element = container.querySelector('[data-testid="test"]');
        expect(element).toBeTruthy();
        expect(element?.textContent).toBe('Hello from React');
        resolve(true);
      }, 100);
    });
  });
});

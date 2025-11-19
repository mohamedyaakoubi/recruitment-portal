'use client';

import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Client Component Test', () => {
    it('should render a client component', () => {
        const TestComponent = () => {
            console.log('TestComponent rendering');
            return <div data-testid="test">Hello from Client Component</div>;
        };

        const { container } = render(<TestComponent />);
        console.log('Container HTML:', container.innerHTML);

        const element = screen.getByTestId('test');
        expect(element).toBeInTheDocument();
        expect(element.textContent).toBe('Hello from Client Component');
    });
});

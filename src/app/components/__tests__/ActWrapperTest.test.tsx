/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';

describe('Testing Library with act() wrapper', () => {
    it('should render with act wrapper', async () => {
        await act(async () => {
            render(<div data-testid="test">Hello World</div>);
        });

        const element = screen.queryByTestId('test');
        console.log('Element found:', element);
        console.log('Element text:', element?.textContent);
        console.log('Body HTML:', document.body.innerHTML);

        expect(element).toBeTruthy();
        expect(element?.textContent).toBe('Hello World');
    });
});

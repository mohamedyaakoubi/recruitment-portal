/**
 * @jest-environment jsdom
 */

describe('Ultra Minimal Test', () => {
    it('should have a working jsdom environment', () => {
        const div = document.createElement('div');
        div.setAttribute('data-testid', 'test');
        div.textContent = 'Hello World';
        document.body.appendChild(div);

        const found = document.querySelector('[data-testid="test"]');
        expect(found).toBeTruthy();
        expect(found?.textContent).toBe('Hello World');
    });
});

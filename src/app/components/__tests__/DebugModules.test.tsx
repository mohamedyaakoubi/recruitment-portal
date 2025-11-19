import React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as RTL from '@testing-library/react';

describe('Debug Test Environment', () => {
    it('should show what modules are loaded', () => {
        console.log('React version:', React.version);
        console.log('ReactDOM:', typeof ReactDOM);
        console.log('RTL render:', typeof RTL.render);
        console.log('RTL render toString:', RTL.render.toString().substring(0, 200));

        // Try calling render directly
        const result = RTL.render(<div>Test</div>);
        console.log('Render result container:', result.container);
        console.log('Render result container.innerHTML:', result.container.innerHTML);
        console.log('Render result container.outerHTML:', result.container.outerHTML);

        expect(true).toBe(true);
    });
});

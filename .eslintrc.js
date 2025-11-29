module.exports = {
    root: true,
    extends: ['next/core-web-vitals', 'next/typescript'],
    settings: {
        react: {
            version: '18.3.1',
        },
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            rules: {
                // Disable prop-types for TypeScript files
                'react/prop-types': 'off',
            },
        },
    ],
    rules: {
        'react/no-unescaped-entities': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-ts-comment': 'error',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'react-hooks/exhaustive-deps': 'error',
        '@next/next/no-img-element': 'error',
    },
};

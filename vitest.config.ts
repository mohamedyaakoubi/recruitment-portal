import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        exclude: ['**/node_modules/**', '**/e2e/**'],
        deps: {
            inline: ['firebase', '@firebase/firestore'],
        },
    },
    resolve: {
        alias: {
            '@/components': path.resolve(__dirname, './src/app/components'),
            '@/hooks': path.resolve(__dirname, './src/hooks'),
            '@/lib': path.resolve(__dirname, './src/lib'),
            '@/services': path.resolve(__dirname, './src/services'),
            '@/types': path.resolve(__dirname, './src/types'),
            '@/app': path.resolve(__dirname, './src/app'),
        },
    },
});

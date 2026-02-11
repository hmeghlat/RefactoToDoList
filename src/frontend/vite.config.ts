import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    root: __dirname,
    server: {
        port: 5173,
        proxy: {
            '/items': 'http://localhost:3000',
        },
    },
    build: {
        outDir: '../../dist-frontend',
    },
});
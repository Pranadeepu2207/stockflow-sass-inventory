import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// run vite dev server on port 3000 and forward /api calls to express on port 5000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

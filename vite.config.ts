import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  resolve: {
    alias: {
      // Sets '@' to point to the root directory
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    hmr: true,
    proxy: {
      // Forwards frontend requests from /murf-api to the actual API
      '/murf-api': {
        target: 'https://api.murf.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/murf-api/, ''),
      },
    },
  },
});
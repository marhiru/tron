import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main/index.ts'),
        renderer: resolve(__dirname, 'index.html')
      }
    }
  }
}); 
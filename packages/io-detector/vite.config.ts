import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/auto-init.ts'),
      name: 'IODetector',
      fileName: 'io-detector',
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
    },
    sourcemap: true,
    minify: 'esbuild',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});

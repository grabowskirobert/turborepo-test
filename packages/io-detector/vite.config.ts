import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IODetector',
      fileName: 'io-detector',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        banner: `'use client';`,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
  define: {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    'import.meta.env.DEV': JSON.stringify(
      process.env.NODE_ENV !== 'production',
    ),
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Second build: the importable public API (`@repo/io-detector`).
 *
 * Separate from vite.config.ts because that build produces the standalone
 * bundle injected into arbitrary pages, so it has to *inline* React. Here
 * React and the stores are external — the consuming app provides them, and
 * bundling a second copy would break hooks.
 *
 * Runs after the bundle build, hence `emptyOutDir: false`.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: () => 'index.js',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        // Rollup drops module-level directives when bundling, so the
        // 'use client' from io-detector.tsx would be lost and React Server
        // Components would try to render this on the server. The whole
        // entry is browser-only, so re-adding it at the top is correct.
        banner: "'use client';",
      },
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-dom/client',
        'nanostores',
        '@nanostores/react',
      ],
    },
    sourcemap: true,
    minify: false,
  },
});

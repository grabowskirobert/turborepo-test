import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import manifest from './manifest.json' with { type: 'json' };

const IO_DETECTOR_SOURCE = resolve(
  __dirname,
  '../../packages/io-detector/dist/io-detector.js',
);
const PUBLIC_BUNDLE = resolve(__dirname, 'public/io-detector.bundle.js');

/**
 * Pre-build step: stage io-detector bundle in `public/` so @crxjs can
 * resolve the `web_accessible_resources` entry from the manifest, then
 * Vite will copy it through to `dist/` automatically.
 */
function stageIODetectorBundle() {
  return {
    name: 'stage-io-detector-bundle',
    buildStart() {
      if (!existsSync(IO_DETECTOR_SOURCE)) {
        throw new Error(
          `[stage-io-detector-bundle] Source bundle not found at ${IO_DETECTOR_SOURCE}. ` +
            'Run `pnpm --filter @repo/io-detector build` first.',
        );
      }
      mkdirSync(resolve(__dirname, 'public'), { recursive: true });
      copyFileSync(IO_DETECTOR_SOURCE, PUBLIC_BUNDLE);
    },
  };
}

export default defineConfig({
  plugins: [stageIODetectorBundle(), react(), crx({ manifest })],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        panel: resolve(__dirname, 'src/panel.html'),
      },
    },
  },
});

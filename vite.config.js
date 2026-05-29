import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  // publicDir: false prevents Vite from copying the entire project into dist.
  // Media files live in the repo root and are served directly by the dev server
  // (and by GitHub Pages from the repo root in production).
  publicDir: false,
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
});

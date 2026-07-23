import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

/**
 * Test configuration.
 *
 * Two environments, chosen per file:
 *   - `node`   for token maths, governance invariants and prerendered-HTML checks;
 *   - `jsdom`  for component behaviour (keyboard, RTL, reduced motion) and axe.
 *
 * There is no browser download and no dev server: accessibility tests run
 * against the **real prerendered HTML** emitted by `next build`, parsed in
 * jsdom. That keeps the whole suite self-contained and runnable in any session.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@brand': resolve(__dirname, 'brand'),
    },
  },
  esbuild: {
    // tsconfig uses `jsx: preserve` for Next; tests need real transformation.
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    environmentMatchGlobs: [['tests/dom/**', 'jsdom']],
    globals: false,
    restoreMocks: true,
  },
});

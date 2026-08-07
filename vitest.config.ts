import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

/**
 * Unit and component tests (PFOS-ENG-00 §31.1).
 *
 * End-to-end tests live in tests/e2e and are run by Playwright, not Vitest.
 * Integration, property-based, and migration test scopes (§31.2-§31.4) are
 * added by the milestones that introduce the code they cover.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: false,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      restoreMocks: true,
    },
  }),
);

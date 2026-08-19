import { defineConfig, devices } from '@playwright/test';

const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * End-to-end tests (PFOS-ENG-00 §31.5).
 *
 * §31.5 states that end-to-end tests cover the five core product questions. The
 * specs here drive the first of them in a real browser: building a plan,
 * previewing a paycheck, confirming it, and reading the confirmed history back
 * after a reload.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  /* Conditional spread: `exactOptionalPropertyTypes` forbids an explicit undefined. */
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

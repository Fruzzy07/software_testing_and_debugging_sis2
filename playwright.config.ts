import { defineConfig, devices } from '@playwright/test';
import { BASE_URL } from './data/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // The target is a shared public demo that is sometimes slow. One local retry
  // absorbs a network hiccup; a real defect still fails twice and goes red.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,                 // 1. relative goto()
    testIdAttribute: 'data-test',      // 2. getByTestId() maps to data-test="…"
    trace: 'on-first-retry',           // 3. a full recording whenever a test has to retry
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // Registers a throw-away customer once and saves the signed-in session.
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});

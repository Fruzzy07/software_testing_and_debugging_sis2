import { defineConfig, devices } from '@playwright/test';
import { BASE_URL } from './data/env';

// Every CI-only behaviour hangs off this one flag. GitHub Actions sets CI=true
// automatically; locally the config behaves as before.
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,               // shards split tests, not whole files
  forbidOnly: isCI,                  // a forgotten test.only fails CI instead of running one test
  // The target is a shared public demo that is sometimes slow. One local retry
  // absorbs a network hiccup; a real defect still fails twice and goes red.
  // In CI a test that passes on retry is reported as "flaky", not green.
  retries: isCI ? 2 : 1,
  workers: isCI ? 2 : 4,             // GitHub-hosted runners have 2-4 vCPUs
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: isCI
    ? [
        ['list'],
        ['blob'],                                        // one per shard, merged by merge.config.ts
        ['junit', { outputFile: 'reports/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,                 // 1. relative goto()
    testIdAttribute: 'data-test',      // 2. getByTestId() maps to data-test="…"
    trace: 'on-first-retry',           // 3. a full recording whenever a test has to retry
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // Registers a throw-away customer once and saves the signed-in session.
    // Project dependencies are not sharded: every shard runs this setup first.
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});

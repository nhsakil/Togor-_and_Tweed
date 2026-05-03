import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [['html', { outputFolder: 'tests/reports/html' }], ['json', { outputFile: 'tests/reports/results.json' }]],
  timeout: 30000,
  expect: { timeout: 8000 },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'safari',   use: { ...devices['Desktop Safari'] } },
    { name: 'edge',     use: { ...devices['Desktop Edge'] } },
    { name: 'mobile-ios',     use: { ...devices['iPhone 14'] } },
    { name: 'mobile-android', use: { ...devices['Pixel 7'] } },
  ],
});

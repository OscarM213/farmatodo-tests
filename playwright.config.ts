import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  projects: [
    {
      name: 'api',
      testDir: './tests',
      testMatch: ['**/utils/**', '**/integration/**'],
      use: {
        trace: 'on-first-retry',
      },
    },
    {
      name: 'e2e',
      testDir: './tests',
      testMatch: ['**/e2e/**'],
      use: {
        baseURL: 'https://www.saucedemo.com',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
        },
        ...devices['Desktop Chrome'],
      },
    },
  ],
});

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    browserName: 'chromium',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : undefined,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: '375x667', use: { viewport: { width: 375, height: 667 } } },
    { name: '390x844', use: { viewport: { width: 390, height: 844 } } },
    { name: '768x1024', use: { viewport: { width: 768, height: 1024 } } },
    { name: '1024x768', use: { viewport: { width: 1024, height: 768 } } },
    { name: '1440x900', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'node .output/server/index.mjs',
    env: { PORT: '3100', HOST: '127.0.0.1' },
    url: 'http://127.0.0.1:3100/de',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})

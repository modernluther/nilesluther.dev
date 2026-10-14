import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
// Share .env with the test process so key checks match what the build sees.
if (existsSync('.env')) process.loadEnvFile('.env');
export default defineConfig({
  testDir: 'tests',
  use: { baseURL: 'http://localhost:4321' },
  webServer: { command: 'npm run build && npm run preview', url: 'http://localhost:4321', reuseExistingServer: !process.env.CI, timeout: 120_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome' } }],
});

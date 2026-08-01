
/**
 * Playwright config for documentation generators (screenshots, etc.)
 *
 * Separate from the main test config so generators are never picked up
 * by CI test sweeps. Run via:
 *   npm run docs:screenshots
 */

/// <reference types="node" />

import path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from '@playwright/test';

const serverURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8088';
const baseURL = serverURL.endsWith('/') ? serverURL : `${serverURL}/`;

export default defineConfig({
  testDir: '.',

  globalSetup: '../global-setup.ts',

  timeout: 90000,
  expect: { timeout: 30000 },

  fullyParallel: false,
  workers: 1,
  retries: 0,

  reporter: [['list']],

  use: {
    baseURL,

    headless: true,
    viewport: { width: 1280, height: 1024 },

    screenshot: 'off',
    video: 'off',
    trace: 'off',
  },

  projects: [
    {
      name: 'docs-generators',
      use: {
        browserName: 'chromium',
        baseURL, // explicit here so globalSetup can read it from config.projects[0].use.baseURL
        testIdAttribute: 'data-test',
        storageState: path.resolve(__dirname, '../.auth/user.json'),
      },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: `curl -f ${serverURL}/health`,
        url: `${serverURL}/health`,
        reuseExistingServer: true,
        timeout: 5000,
      },
});

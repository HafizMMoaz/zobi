// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'cypress';

const { verifyDownloadTasks } = require('cy-verify-downloads');

export default defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 8000,
  numTestsKeptInMemory: 3,
  // Disabled after realizing this MESSES UP rison encoding in intricate ways
  experimentalFetchPolyfill: false,
  experimentalMemoryManagement: true,
  requestTimeout: 10000,
  video: false,
  viewportWidth: 1280,
  viewportHeight: 1024,
  projectId: 'ud5x2f',
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // ECONNRESET on Chrome/Chromium 117.0.5851.0 when using Cypress <12.15.0
      // Check https://github.com/cypress-io/cypress/issues/27804 for context
      // TODO: This workaround should be removed when upgrading Cypress
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          // eslint-disable-next-line no-param-reassign
          launchOptions.args = launchOptions.args.map(arg => {
            if (arg === '--headless') {
              return '--headless=new';
            }

            return arg;
          });

          launchOptions.args.push(
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-software-rasterizer',
            '--memory-pressure-off',
            '--js-flags=--max-old-space-size=4096',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          );
        }
        return launchOptions;
      });

      // eslint-disable-next-line global-require
      require('@cypress/code-coverage/task')(on, config);
      on('task', verifyDownloadTasks);
      // eslint-disable-next-line global-require,import/extensions
      return config;
    },
    baseUrl: 'http://localhost:8088',
    excludeSpecPattern: ['**/_skip.*'],
    experimentalRunAllSpecs: true,
    specPattern: ['cypress/e2e/**/*.{js,jsx,ts,tsx}'],
  },
});

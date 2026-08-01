import type { TestRunnerConfig } from '@storybook/test-runner';

/**
 * Test runner configuration for Storybook smoke tests.
 *
 * The test-runner visits each story and verifies it renders without errors.
 * These are basic smoke tests - they don't test interactions or assertions,
 * just that stories can render successfully.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    // Listen for page errors (JavaScript exceptions) and log them
    // This helps identify stories that crash during rendering
    page.on('pageerror', error => {
      console.error(`[page error] ${error.message}`);
    });
  },
};

export default config;

/**
 * Jest configuration for @storybook/test-runner
 *
 * This extends the default test-runner config with custom timeouts
 * to handle slow story rendering in CI environments.
 */
const { getJestConfig } = require('@storybook/test-runner');
const testRunnerConfig = getJestConfig();

module.exports = {
  ...testRunnerConfig,
  // Increase timeout from default 15s to 60s for CI environments
  testTimeout: 60000,
};

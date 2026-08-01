
/**
 * URL constants for Playwright navigation
 *
 * These are relative paths (no leading '/') that rely on baseURL ending with '/'.
 * playwright.config.ts normalizes baseURL to always end with '/' to ensure
 * correct URL resolution with APP_PREFIX (e.g., /app/prefix/).
 *
 * Example: baseURL='http://localhost:8088/app/prefix/' + 'tablemodelview/list'
 *        = 'http://localhost:8088/app/prefix/tablemodelview/list'
 */
export const URL = {
  CHART_ADD: 'chart/add',
  CHART_LIST: 'chart/list/',
  DASHBOARD_LIST: 'dashboard/list/',
  DATASET_LIST: 'tablemodelview/list',
  LOGIN: 'login/',
  SAVED_QUERIES_LIST: 'savedqueryview/list/',
  SQLLAB: 'sqllab',
  WELCOME: 'zobi/welcome/',
} as const;

import { exportChart } from '.';

// Mock pathUtils to control app root prefix
jest.mock('src/utils/pathUtils', () => ({
  ensureAppRoot: jest.fn((path: string) => path),
}));

// Mock ZobiClient
jest.mock('@zobi-ui/core', () => ({
  ...jest.requireActual('@zobi-ui/core'),
  ZobiClient: {
    postForm: jest.fn(),
    get: jest.fn().mockResolvedValue({ json: {} }),
    post: jest.fn().mockResolvedValue({ json: {} }),
  },
  getChartBuildQueryRegistry: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(() => () => ({})),
  }),
  getChartMetadataRegistry: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({ parseMethod: 'json' }),
  }),
}));

const { ensureAppRoot } = jest.requireMock('src/utils/pathUtils');
const { getChartMetadataRegistry } = jest.requireMock('@zobi-ui/core');

// Minimal formData that won't trigger legacy API (useLegacyApi = false)
const baseFormData = {
  datasource: '1__table',
  viz_type: 'table',
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default: no prefix
  ensureAppRoot.mockImplementation((path: string) => path);
  // Default: v1 API (not legacy)
  getChartMetadataRegistry.mockReturnValue({
    get: jest.fn().mockReturnValue({ parseMethod: 'json' }),
  });
});

// Tests for exportChart URL prefix handling in streaming export.
// Streaming uses native fetch (not ZobiClient), so exportChart must apply
// ensureAppRoot before passing the URL to onStartStreamingExport.
test('exportChart v1 API passes prefixed URL to onStartStreamingExport when app root is configured', async () => {
  const appRoot = '/zobi';
  ensureAppRoot.mockImplementation((path: string) => `${appRoot}${path}`);

  const onStartStreamingExport = jest.fn();

  await exportChart({
    formData: baseFormData,
    resultFormat: 'csv',
    onStartStreamingExport: onStartStreamingExport as unknown as null,
  });

  expect(onStartStreamingExport).toHaveBeenCalledTimes(1);
  const callArgs = onStartStreamingExport.mock.calls[0][0];
  expect(callArgs.url).toBe('/zobi/api/v1/chart/data');
  expect(callArgs.exportType).toBe('csv');
});

test('exportChart v1 API passes unprefixed URL when no app root is configured', async () => {
  ensureAppRoot.mockImplementation((path: string) => path);

  const onStartStreamingExport = jest.fn();

  await exportChart({
    formData: baseFormData,
    resultFormat: 'csv',
    onStartStreamingExport: onStartStreamingExport as unknown as null,
  });

  expect(onStartStreamingExport).toHaveBeenCalledTimes(1);
  const callArgs = onStartStreamingExport.mock.calls[0][0];
  expect(callArgs.url).toBe('/api/v1/chart/data');
});

test('exportChart v1 API passes nested prefix for deeply nested deployments', async () => {
  const appRoot = '/my-company/analytics/zobi';
  ensureAppRoot.mockImplementation((path: string) => `${appRoot}${path}`);

  const onStartStreamingExport = jest.fn();

  await exportChart({
    formData: baseFormData,
    resultFormat: 'xlsx',
    onStartStreamingExport: onStartStreamingExport as unknown as null,
  });

  expect(onStartStreamingExport).toHaveBeenCalledTimes(1);
  const callArgs = onStartStreamingExport.mock.calls[0][0];
  expect(callArgs.url).toBe('/my-company/analytics/zobi/api/v1/chart/data');
  expect(callArgs.exportType).toBe('xlsx');
});

// Regression test for the double-prefix bug: ZobiClient.postForm adds appRoot
// internally via getUrl(), so the URL passed must NOT already be prefixed.
test('exportChart v1 API calls postForm with unprefixed URL when app root is configured', async () => {
  const { ZobiClient } = jest.requireMock('@zobi-ui/core');
  const appRoot = '/analytics';
  ensureAppRoot.mockImplementation((path: string) => `${appRoot}${path}`);

  await exportChart({
    formData: baseFormData,
    resultFormat: 'csv',
  });

  expect(ZobiClient.postForm).toHaveBeenCalledTimes(1);
  const [url] = ZobiClient.postForm.mock.calls[0];
  expect(url).toBe('/api/v1/chart/data');
  expect(url).not.toContain(appRoot);
});

test('exportChart passes csv exportType for CSV exports', async () => {
  const onStartStreamingExport = jest.fn();

  await exportChart({
    formData: baseFormData,
    resultFormat: 'csv',
    onStartStreamingExport: onStartStreamingExport as unknown as null,
  });

  expect(onStartStreamingExport).toHaveBeenCalledWith(
    expect.objectContaining({
      exportType: 'csv',
    }),
  );
});

test('exportChart passes xlsx exportType for Excel exports', async () => {
  const onStartStreamingExport = jest.fn();

  await exportChart({
    formData: baseFormData,
    resultFormat: 'xlsx',
    onStartStreamingExport: onStartStreamingExport as unknown as null,
  });

  expect(onStartStreamingExport).toHaveBeenCalledWith(
    expect.objectContaining({
      exportType: 'xlsx',
    }),
  );
});

test('exportChart legacy API (useLegacyApi=true) passes prefixed URL to onStartStreamingExport when app root is configured', async () => {
  const appRoot = '/zobi';
  ensureAppRoot.mockImplementation((path: string) => `${appRoot}${path}`);

  getChartMetadataRegistry.mockReturnValue({
    get: jest.fn().mockReturnValue({ useLegacyApi: true, parseMethod: 'json' }),
  });

  const onStartStreamingExport = jest.fn();
  const legacyFormData = {
    datasource: '1__table',
    viz_type: 'legacy_viz',
  };

  await exportChart({
    formData: legacyFormData,
    resultFormat: 'csv',
    onStartStreamingExport: onStartStreamingExport as unknown as null,
  });

  expect(onStartStreamingExport).toHaveBeenCalledTimes(1);
  const callArgs = onStartStreamingExport.mock.calls[0][0];
  // The legacy blueprint path is /zobi/explore_json/; with appRoot=/zobi the
  // full streaming URL is /zobi/zobi/explore_json/ (appRoot + blueprint prefix).
  expect(callArgs.url).toBe('/zobi/zobi/explore_json/?csv=true');
  expect(callArgs.exportType).toBe('csv');
});

test('exportChart legacy API builds relative URL for CSV export without app root', async () => {
  ensureAppRoot.mockImplementation((path: string) => path);

  getChartMetadataRegistry.mockReturnValue({
    get: jest.fn().mockReturnValue({ useLegacyApi: true, parseMethod: 'json' }),
  });

  const onStartStreamingExport = jest.fn();
  const legacyFormData = {
    datasource: '1__table',
    viz_type: 'world_map',
  };

  await exportChart({
    formData: legacyFormData,
    resultFormat: 'csv',
    onStartStreamingExport: onStartStreamingExport as unknown as null,
  });

  expect(onStartStreamingExport).toHaveBeenCalledTimes(1);
  const callArgs = onStartStreamingExport.mock.calls[0][0];
  expect(callArgs.url).toBe('/zobi/explore_json/?csv=true');
});

test('exportChart legacy API builds relative URL for xlsx export', async () => {
  ensureAppRoot.mockImplementation((path: string) => path);

  getChartMetadataRegistry.mockReturnValue({
    get: jest.fn().mockReturnValue({ useLegacyApi: true, parseMethod: 'json' }),
  });

  const onStartStreamingExport = jest.fn();
  const legacyFormData = {
    datasource: '1__table',
    viz_type: 'bubble',
  };

  await exportChart({
    formData: legacyFormData,
    resultFormat: 'xlsx',
    resultType: 'results',
    onStartStreamingExport: onStartStreamingExport as unknown as null,
  });

  expect(onStartStreamingExport).toHaveBeenCalledTimes(1);
  const callArgs = onStartStreamingExport.mock.calls[0][0];
  expect(callArgs.url).toBe('/zobi/explore_json/?xlsx=true');
});

test('exportChart legacy API calls postForm with relative URL', async () => {
  const { ZobiClient } = jest.requireMock('@zobi-ui/core');
  ensureAppRoot.mockImplementation((path: string) => path);

  getChartMetadataRegistry.mockReturnValue({
    get: jest.fn().mockReturnValue({ useLegacyApi: true, parseMethod: 'json' }),
  });

  const legacyFormData = {
    datasource: '1__table',
    viz_type: 'world_map',
  };

  await exportChart({
    formData: legacyFormData,
    resultFormat: 'csv',
    resultType: 'full',
  });

  expect(ZobiClient.postForm).toHaveBeenCalledTimes(1);
  const [url] = ZobiClient.postForm.mock.calls[0];
  expect(url).toBe('/zobi/explore_json/?csv=true');
  expect(url).not.toMatch(/^https?:\/\//);
});

test('exportChart legacy API includes force param when force=true', async () => {
  ensureAppRoot.mockImplementation((path: string) => path);

  getChartMetadataRegistry.mockReturnValue({
    get: jest.fn().mockReturnValue({ useLegacyApi: true, parseMethod: 'json' }),
  });

  const onStartStreamingExport = jest.fn();
  const legacyFormData = {
    datasource: '1__table',
    viz_type: 'world_map',
  };

  await exportChart({
    formData: legacyFormData,
    resultFormat: 'csv',
    force: true,
    onStartStreamingExport: onStartStreamingExport as unknown as null,
  });

  expect(onStartStreamingExport).toHaveBeenCalledTimes(1);
  const callArgs = onStartStreamingExport.mock.calls[0][0];
  expect(callArgs.url).toBe('/zobi/explore_json/?force=true&csv=true');
});

import {
  zobiGetCache,
  clearDatasetCache,
  clearAllDatasetCache,
} from './cachedZobiGet';

describe('cachedZobiGet', () => {
  beforeEach(() => {
    zobiGetCache.clear();
  });

  describe('clearDatasetCache', () => {
    test('clears cache entries for specific dataset ID', () => {
      zobiGetCache.set('/api/v1/dataset/123', { data: 'dataset123' });
      zobiGetCache.set('/api/v1/dataset/123/', { data: 'dataset123slash' });
      zobiGetCache.set('/api/v1/dataset/123?query=1', {
        data: 'dataset123query',
      });
      zobiGetCache.set('/api/v1/dataset/456', { data: 'dataset456' });
      zobiGetCache.set('/api/v1/other/123', { data: 'other' });

      clearDatasetCache(123);

      expect(zobiGetCache.has('/api/v1/dataset/123')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/123/')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/123?query=1')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/456')).toBe(true);
      expect(zobiGetCache.has('/api/v1/other/123')).toBe(true);
    });

    test('clears cache entries for string dataset ID', () => {
      zobiGetCache.set('/api/v1/dataset/abc-123', { data: 'datasetAbc' });
      zobiGetCache.set('/api/v1/dataset/abc-123/', {
        data: 'datasetAbcSlash',
      });
      zobiGetCache.set('/api/v1/dataset/def-456', { data: 'datasetDef' });

      clearDatasetCache('abc-123');

      expect(zobiGetCache.has('/api/v1/dataset/abc-123')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/abc-123/')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/def-456')).toBe(true);
    });

    test('handles null dataset ID gracefully', () => {
      zobiGetCache.set('/api/v1/dataset/123', { data: 'dataset123' });

      clearDatasetCache(null as any);

      expect(zobiGetCache.has('/api/v1/dataset/123')).toBe(true);
    });

    test('handles undefined dataset ID gracefully', () => {
      zobiGetCache.set('/api/v1/dataset/123', { data: 'dataset123' });

      clearDatasetCache(undefined as any);

      expect(zobiGetCache.has('/api/v1/dataset/123')).toBe(true);
    });

    test('handles empty string dataset ID gracefully', () => {
      zobiGetCache.set('/api/v1/dataset/123', { data: 'dataset123' });

      clearDatasetCache('');

      expect(zobiGetCache.has('/api/v1/dataset/123')).toBe(true);
    });

    test('does not clear unrelated cache entries', () => {
      zobiGetCache.set('/api/v1/chart/123', { data: 'chart123' });
      zobiGetCache.set('/api/v1/dashboard/123', { data: 'dashboard123' });
      zobiGetCache.set('/api/v1/database/123', { data: 'database123' });
      zobiGetCache.set('/api/v1/dataset/123', { data: 'dataset123' });

      clearDatasetCache(123);

      expect(zobiGetCache.has('/api/v1/chart/123')).toBe(true);
      expect(zobiGetCache.has('/api/v1/dashboard/123')).toBe(true);
      expect(zobiGetCache.has('/api/v1/database/123')).toBe(true);
      expect(zobiGetCache.has('/api/v1/dataset/123')).toBe(false);
    });

    test('only clears exact dataset ID matches', () => {
      zobiGetCache.set('/api/v1/dataset/1', { data: 'dataset1' });
      zobiGetCache.set('/api/v1/dataset/12', { data: 'dataset12' });
      zobiGetCache.set('/api/v1/dataset/123', { data: 'dataset123' });
      zobiGetCache.set('/api/v1/dataset/1234', { data: 'dataset1234' });
      zobiGetCache.set('/api/v1/dataset/456', { data: 'dataset456' });

      clearDatasetCache(123);

      expect(zobiGetCache.has('/api/v1/dataset/1')).toBe(true);
      expect(zobiGetCache.has('/api/v1/dataset/12')).toBe(true);
      expect(zobiGetCache.has('/api/v1/dataset/123')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/1234')).toBe(true); // Should not be cleared - different ID
      expect(zobiGetCache.has('/api/v1/dataset/456')).toBe(true);
    });

    test('clears cache entries with various URL patterns', () => {
      zobiGetCache.set('/api/v1/dataset/789', { data: 'base' });
      zobiGetCache.set('/api/v1/dataset/789/columns', { data: 'columns' });
      zobiGetCache.set('/api/v1/dataset/789/related', { data: 'related' });
      zobiGetCache.set('/api/v1/dataset/789?full=true', {
        data: 'withQuery',
      });

      clearDatasetCache(789);

      expect(zobiGetCache.has('/api/v1/dataset/789')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/789/columns')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/789/related')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/789?full=true')).toBe(false);
    });
  });

  describe('clearAllDatasetCache', () => {
    test('clears all dataset cache entries', () => {
      zobiGetCache.set('/api/v1/dataset/123', { data: 'dataset123' });
      zobiGetCache.set('/api/v1/dataset/456', { data: 'dataset456' });
      zobiGetCache.set('/api/v1/dataset/789/columns', { data: 'columns' });
      zobiGetCache.set('/api/v1/chart/123', { data: 'chart123' });
      zobiGetCache.set('/api/v1/dashboard/456', { data: 'dashboard456' });

      clearAllDatasetCache();

      expect(zobiGetCache.has('/api/v1/dataset/123')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/456')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/789/columns')).toBe(false);
      expect(zobiGetCache.has('/api/v1/chart/123')).toBe(true);
      expect(zobiGetCache.has('/api/v1/dashboard/456')).toBe(true);
    });

    test('handles empty cache gracefully', () => {
      expect(zobiGetCache.size).toBe(0);

      clearAllDatasetCache();

      expect(zobiGetCache.size).toBe(0);
    });

    test('preserves non-dataset cache entries', () => {
      zobiGetCache.set('/api/v1/chart/list', { data: 'chartList' });
      zobiGetCache.set('/api/v1/dashboard/list', { data: 'dashboardList' });
      zobiGetCache.set('/api/v1/database/list', { data: 'databaseList' });
      zobiGetCache.set('/api/v1/query/list', { data: 'queryList' });

      clearAllDatasetCache();

      expect(zobiGetCache.has('/api/v1/chart/list')).toBe(true);
      expect(zobiGetCache.has('/api/v1/dashboard/list')).toBe(true);
      expect(zobiGetCache.has('/api/v1/database/list')).toBe(true);
      expect(zobiGetCache.has('/api/v1/query/list')).toBe(true);
    });

    test('clears all variations of dataset endpoints', () => {
      zobiGetCache.set('/api/v1/dataset/', { data: 'list' });
      zobiGetCache.set('/api/v1/dataset/export', { data: 'export' });
      zobiGetCache.set('/api/v1/dataset/import', { data: 'import' });
      zobiGetCache.set('/api/v1/dataset/duplicate', { data: 'duplicate' });
      zobiGetCache.set('/api/v1/dataset/1/refresh', { data: 'refresh' });

      clearAllDatasetCache();

      expect(zobiGetCache.has('/api/v1/dataset/')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/export')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/import')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/duplicate')).toBe(false);
      expect(zobiGetCache.has('/api/v1/dataset/1/refresh')).toBe(false);
    });
  });
});

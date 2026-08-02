import { ZobiClient } from '@zobi.dev/core';
import { cacheWrapper } from './cacheWrapper';

export const zobiGetCache = new Map<string, any>();

export const cachedZobiGet = cacheWrapper(
  ZobiClient.get,
  zobiGetCache,
  ({ endpoint }) => endpoint || '',
);

/**
 * Clear cached responses for dataset-related endpoints
 * @param datasetId - The ID of the dataset to clear from cache
 */
export function clearDatasetCache(datasetId: number | string): void {
  if (datasetId === null || datasetId === undefined || datasetId === '') return;

  const datasetIdStr = String(datasetId);

  zobiGetCache.forEach((_value, key) => {
    // Match exact dataset ID patterns:
    // - /api/v1/dataset/123 (exact match or end of URL)
    // - /api/v1/dataset/123/ (with trailing slash)
    // - /api/v1/dataset/123? (with query params)
    const patterns = [
      `/api/v1/dataset/${datasetIdStr}`,
      `/api/v1/dataset/${datasetIdStr}/`,
      `/api/v1/dataset/${datasetIdStr}?`,
    ];

    for (const pattern of patterns) {
      if (key.includes(pattern)) {
        // Additional check to ensure we don't match longer IDs
        const afterPattern = key.substring(
          key.indexOf(pattern) + pattern.length,
        );
        // If pattern ends with slash or query, it's already precise
        if (pattern.endsWith('/') || pattern.endsWith('?')) {
          zobiGetCache.delete(key);
          break;
        }
        // For the base pattern, ensure nothing follows or only valid separators
        if (
          afterPattern === '' ||
          afterPattern.startsWith('/') ||
          afterPattern.startsWith('?')
        ) {
          zobiGetCache.delete(key);
          break;
        }
      }
    }
  });
}

/**
 * Clear all cached dataset responses
 */
export function clearAllDatasetCache(): void {
  zobiGetCache.forEach((_value, key) => {
    if (key.includes('/api/v1/dataset/')) {
      zobiGetCache.delete(key);
    }
  });
}

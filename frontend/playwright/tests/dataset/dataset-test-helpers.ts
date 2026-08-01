
import type { Page, TestInfo } from '@playwright/test';
import type { TestAssets } from '../../helpers/fixtures';
import { createTestVirtualDataset } from '../../helpers/api/dataset';

interface TestDatasetResult {
  id: number;
  name: string;
}

interface CreateTestDatasetOptions {
  /** Prefix for generated name (default: 'test') */
  prefix?: string;
}

/**
 * Creates a test virtual dataset.
 * Uses createTestVirtualDataset() to create a simple virtual dataset for testing.
 *
 * Note: The dataset duplicate API only works with virtual datasets. This helper
 * creates virtual datasets directly to avoid that limitation.
 *
 * @example
 * // Basic usage
 * const { id, name } = await createTestDataset(page, testAssets, test.info());
 *
 * @example
 * // Custom prefix
 * const { id, name } = await createTestDataset(page, testAssets, test.info(), {
 *   prefix: 'test_delete',
 * });
 */
export async function createTestDataset(
  page: Page,
  testAssets: TestAssets,
  testInfo: TestInfo,
  options?: CreateTestDatasetOptions,
): Promise<TestDatasetResult> {
  const prefix = options?.prefix ?? 'test';
  const name = `${prefix}_${Date.now()}_${testInfo.parallelIndex}`;

  const id = await createTestVirtualDataset(page, name);
  if (!id) {
    throw new Error(`Failed to create test dataset: ${name}`);
  }
  testAssets.trackDataset(id);

  return { id, name };
}

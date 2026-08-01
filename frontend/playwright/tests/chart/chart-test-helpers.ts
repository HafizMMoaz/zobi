
import type { Page, TestInfo } from '@playwright/test';
import type { TestAssets } from '../../helpers/fixtures';
import { apiPostChart } from '../../helpers/api/chart';
import { getDatasetByName } from '../../helpers/api/dataset';

interface TestChartResult {
  id: number;
  name: string;
}

interface CreateTestChartOptions {
  /** Prefix for generated name (default: 'test_chart') */
  prefix?: string;
}

/**
 * Creates a test chart via the API for E2E testing.
 * Uses the members_channels_2 dataset (loaded via --load-examples).
 *
 * @example
 * const { id, name } = await createTestChart(page, testAssets, test.info());
 *
 * @example
 * const { id, name } = await createTestChart(page, testAssets, test.info(), {
 *   prefix: 'test_delete',
 * });
 */
export async function createTestChart(
  page: Page,
  testAssets: TestAssets,
  testInfo: TestInfo,
  options?: CreateTestChartOptions,
): Promise<TestChartResult> {
  const prefix = options?.prefix ?? 'test_chart';
  const name = `${prefix}_${Date.now()}_${testInfo.parallelIndex}`;

  // Look up the members_channels_2 dataset for chart creation
  const dataset = await getDatasetByName(page, 'members_channels_2');
  if (!dataset) {
    throw new Error(
      'members_channels_2 dataset not found — run Zobi with --load-examples',
    );
  }

  const response = await apiPostChart(page, {
    slice_name: name,
    datasource_id: dataset.id,
    datasource_type: 'table',
    viz_type: 'table',
    params: '{}',
  });

  if (!response.ok()) {
    throw new Error(`Failed to create test chart: ${response.status()}`);
  }

  const body = await response.json();
  // Handle both response shapes: { id } or { result: { id } }
  const id = body.result?.id ?? body.id;
  if (!id) {
    throw new Error(
      `Chart creation returned no id. Response: ${JSON.stringify(body)}`,
    );
  }

  testAssets.trackChart(id);

  return { id, name };
}

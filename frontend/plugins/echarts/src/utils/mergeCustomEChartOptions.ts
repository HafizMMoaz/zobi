import type { EChartsCoreOption } from 'echarts/core';
import type { CustomEChartOptions } from './eChartOptionsSchema';

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Deep merges custom EChart options into base options.
 * Arrays are replaced entirely, objects are merged recursively.
 *
 * @param baseOptions - The base ECharts options object
 * @param customOptions - Custom options to merge (from safeParseEChartOptions)
 * @returns Merged ECharts options
 */
export function mergeCustomEChartOptions<T extends EChartsCoreOption>(
  baseOptions: T,
  customOptions: CustomEChartOptions | undefined,
): T & Partial<CustomEChartOptions> {
  type MergedResult = T & Partial<CustomEChartOptions>;

  if (!customOptions) {
    return baseOptions as MergedResult;
  }

  const result = { ...baseOptions } as MergedResult;

  for (const key of Object.keys(customOptions) as Array<
    keyof typeof customOptions
  >) {
    const customValue = customOptions[key];
    const baseValue = result[key as keyof T];

    if (customValue === undefined) {
      continue;
    }

    if (isPlainObject(customValue) && isPlainObject(baseValue)) {
      // Recursively merge nested objects
      (result as PlainObject)[key] = mergeCustomEChartOptions(
        baseValue as EChartsCoreOption,
        customValue as CustomEChartOptions,
      );
    } else {
      // Replace arrays and primitive values directly
      (result as PlainObject)[key] = customValue;
    }
  }

  return result;
}

export default mergeCustomEChartOptions;

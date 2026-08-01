import type { ColumnConfig, Entry } from '../../types';

/**
 * Parses time ratio from string or number
 */
export function parseTimeRatio(timeRatio: string | number): number {
  return typeof timeRatio === 'string' ? parseInt(timeRatio, 10) : timeRatio;
}

/**
 * Transforms entries into time ratio sparkline data
 */
export function transformTimeRatioData(
  entries: Entry[],
  valueField: string,
  timeRatio: number,
): (number | null)[] {
  const sparkData: (number | null)[] = [];

  for (let i = timeRatio; i < entries.length; i += 1) {
    const prevData = entries[i - timeRatio][valueField];
    if (prevData && prevData !== 0) {
      sparkData.push(entries[i][valueField] / prevData);
    } else {
      sparkData.push(null);
    }
  }

  return sparkData;
}

/**
 * Transforms entries into regular sparkline data
 */
export function transformRegularData(
  entries: Entry[],
  valueField: string,
): (number | null)[] {
  return entries.map(d => d[valueField]);
}

/**
 * Transforms entries into sparkline data based on column configuration
 */
export function transformSparklineData(
  valueField: string,
  column: ColumnConfig,
  entries: Entry[],
): (number | null)[] {
  if (column.timeRatio) {
    const timeRatio = parseTimeRatio(column.timeRatio);
    return transformTimeRatioData(entries, valueField, timeRatio);
  }

  return transformRegularData(entries, valueField);
}

/**
 * Parses dimension values with defaults
 */
export function parseSparklineDimensions(column: ColumnConfig) {
  return {
    width: parseInt(column.width || '300', 10),
    height: parseInt(column.height || '50', 10),
  };
}

/**
 * Validates and formats y-axis bounds
 */
export function validateYAxisBounds(
  yAxisBounds: unknown,
): [number | undefined, number | undefined] {
  if (Array.isArray(yAxisBounds) && yAxisBounds.length === 2)
    return yAxisBounds as [number | undefined, number | undefined];

  return [undefined, undefined];
}

import { DiffItemType, DiffType, FilterItemType } from 'src/types/DiffType';
import { safeStringify } from 'src/utils/safeStringify';
import { ControlMap, RowType } from '../types';

export const alterForComparison = (value?: unknown): unknown => {
  // Treat `null`, `undefined`, and empty strings as equivalent
  if (value === undefined || value === null || value === '') return null;

  // Treat empty arrays and objects as equivalent to null
  if (Array.isArray(value) && value.length === 0) return null;

  if (typeof value === 'object' && Object.keys(value).length === 0) return null;

  return value;
};

export const formatValueHandler = (
  value: DiffItemType,
  key = '',
  controlsMap: ControlMap,
): string | number => {
  if (value === undefined) return 'N/A';

  if (value === null) return 'null';

  if (typeof value === 'boolean') return value ? 'true' : 'false';

  if (controlsMap[key]?.type === 'AdhocFilterControl' && Array.isArray(value)) {
    if (!value.length) return '[]';

    return value
      .map((entry): string => {
        // The surrounding controlsMap check establishes that this branch only
        // sees adhoc filters, which the array's own element union cannot say.
        const v = entry as FilterItemType;
        const filterVal: string | string[] | undefined =
          v.comparator && v.comparator.constructor === Array
            ? `[${v.comparator.join(', ')}]`
            : v.comparator;
        return filterVal
          ? `${v.subject} ${v.operator} ${filterVal}`
          : `${v.subject} ${v.operator}`;
      })
      .join(', ');
  }

  if (controlsMap[key]?.type === 'BoundsControl' && Array.isArray(value))
    return `Min: ${value[0]}, Max: ${value[1]}`;

  if (controlsMap[key]?.type === 'CollectionControl' && Array.isArray(value))
    return value.map((v): string => safeStringify(v)).join(', ');

  if (
    controlsMap[key]?.type === 'MetricsControl' &&
    value.constructor === Array
  ) {
    const formattedValue: (string | FilterItemType)[] = value.map(
      (entry): string | FilterItemType => {
        const v = entry as FilterItemType;
        return v?.label ?? v;
      },
    );
    return formattedValue.length ? formattedValue.join(', ') : '[]';
  }

  if (Array.isArray(value)) {
    const formattedValue = value.map((v: any) => {
      if (
        typeof v === 'object' &&
        v !== null &&
        'label' in v &&
        typeof v.label === 'string'
      )
        return v.label;

      return String(v);
    });

    return formattedValue.length ? formattedValue.join(', ') : '[]';
  }

  if (typeof value === 'string' || typeof value === 'number') return value;

  return safeStringify(value);
};

export const getRowsFromDiffs = (
  diffs: { [key: string]: DiffType },
  controlsMap: ControlMap,
): RowType[] =>
  Object.entries(diffs).map(([key, diff]: [string, DiffType]) => ({
    control: controlsMap[key]?.label || key,
    before: formatValueHandler(diff.before, key, controlsMap),
    after: formatValueHandler(diff.after, key, controlsMap),
  }));

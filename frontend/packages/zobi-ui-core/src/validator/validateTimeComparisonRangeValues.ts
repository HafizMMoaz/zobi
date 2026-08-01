

import { ComparisonTimeRangeType } from '../time-comparison';
import { t } from '@zobi/core-legacy/translation';
import { ensureIsArray } from '../utils';

export const validateTimeComparisonRangeValues = (
  timeRangeValue?: unknown,
  controlValue?: unknown,
): string[] => {
  const isCustomTimeRange = timeRangeValue === ComparisonTimeRangeType.Custom;
  const isCustomControlEmpty =
    Array.isArray(controlValue) &&
    controlValue.every((val: unknown) => ensureIsArray(val).length === 0);
  return isCustomTimeRange && isCustomControlEmpty
    ? [t('Filters for comparison must have a value')]
    : [];
};

export default validateTimeComparisonRangeValues;

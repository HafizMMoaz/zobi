

import {
  ComparisonTimeRangeType,
  validateTimeComparisonRangeValues,
} from '@zobi-ui/core';
import './setup';

describe('validateTimeComparisonRangeValues()', () => {
  test('returns the warning message if invalid', () => {
    expect(
      validateTimeComparisonRangeValues(ComparisonTimeRangeType.Custom, []),
    ).toBeTruthy();
    expect(
      validateTimeComparisonRangeValues(
        ComparisonTimeRangeType.Custom,
        undefined,
      ),
    ).toBeTruthy();
    expect(
      validateTimeComparisonRangeValues(ComparisonTimeRangeType.Custom, null),
    ).toBeTruthy();
  });
  test('returns empty array if the input is valid', () => {
    expect(
      validateTimeComparisonRangeValues(ComparisonTimeRangeType.Year, []),
    ).toEqual([]);
    expect(
      validateTimeComparisonRangeValues(
        ComparisonTimeRangeType.Year,
        undefined,
      ),
    ).toEqual([]);
    expect(
      validateTimeComparisonRangeValues(ComparisonTimeRangeType.Year, null),
    ).toEqual([]);
    expect(
      validateTimeComparisonRangeValues(ComparisonTimeRangeType.Custom, [1]),
    ).toEqual([]);
  });
});

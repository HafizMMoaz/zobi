import {
  ComparisonTimeRangeType,
  getComparisonFilters,
  getComparisonInfo,
} from '@zobi.dev/core';

describe('index', () => {
  test('exports modules', () => {
    [ComparisonTimeRangeType, getComparisonFilters, getComparisonInfo].forEach(
      x => expect(x).toBeDefined(),
    );
  });
});

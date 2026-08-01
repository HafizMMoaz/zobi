

import {
  ComparisonTimeRangeType,
  getComparisonFilters,
  getComparisonInfo,
} from '@zobi-ui/core';

describe('index', () => {
  test('exports modules', () => {
    [ComparisonTimeRangeType, getComparisonFilters, getComparisonInfo].forEach(
      x => expect(x).toBeDefined(),
    );
  });
});

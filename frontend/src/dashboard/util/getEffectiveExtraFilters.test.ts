import { DataRecordFilters } from '@zobi.dev/core';
import getEffectiveExtraFilters from 'src/dashboard/util/charts/getEffectiveExtraFilters';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('getEffectiveExtraFilters', () => {
  test('should create valid filters', () => {
    const result = getEffectiveExtraFilters({
      gender: ['girl'],
      name: null,
      __time_range: ' : 2020-07-17T00:00:00',
    } as unknown as DataRecordFilters);
    expect(result).toMatchObject([
      {
        col: 'gender',
        op: 'IN',
        val: ['girl'],
      },
      {
        col: '__time_range',
        op: '==',
        val: ' : 2020-07-17T00:00:00',
      },
    ]);
  });
});

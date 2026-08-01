import { TimeGranularity } from '@zobi.dev/core';
import extractExtras from '../../src/query/extractExtras';

describe('extractExtras', () => {
  const baseQueryFormData = {
    datasource: '1__table',
    granularity_sqla: 'ds',
    time_grain_sqla: TimeGranularity.MINUTE,
    viz_type: 'my_viz',
  };

  test('should populate time range endpoints and override formData with double underscored date options', () => {
    expect(
      extractExtras({
        ...baseQueryFormData,
        extra_filters: [
          {
            col: '__time_col',
            op: '==',
            val: 'ds2',
          },
          {
            col: '__time_grain',
            op: '==',
            val: 'PT5M',
          },
          {
            col: '__time_range',
            op: '==',
            val: '2009-07-17T00:00:00 : 2020-07-17T00:00:00',
          },
        ],
      }),
    ).toEqual({
      applied_time_extras: {
        __time_col: 'ds2',
        __time_grain: 'PT5M',
        __time_range: '2009-07-17T00:00:00 : 2020-07-17T00:00:00',
      },
      extras: {
        time_grain_sqla: 'PT5M',
      },
      filters: [],
      granularity: 'ds2',
      time_range: '2009-07-17T00:00:00 : 2020-07-17T00:00:00',
    });
  });

  test('should create regular filters from non-reserved columns', () => {
    expect(
      extractExtras({
        ...baseQueryFormData,
        extra_filters: [
          {
            col: 'gender',
            op: '==',
            val: 'girl',
          },
          {
            col: 'name',
            op: 'IN',
            val: ['Eve', 'Evelyn'],
          },
        ],
      }),
    ).toEqual({
      applied_time_extras: {},
      extras: {
        time_grain_sqla: 'PT1M',
      },
      filters: [
        {
          col: 'gender',
          op: '==',
          val: 'girl',
        },
        {
          col: 'name',
          op: 'IN',
          val: ['Eve', 'Evelyn'],
        },
      ],
      granularity: 'ds',
    });
  });

  test('should create regular filters from reserved and non-reserved columns', () => {
    expect(
      extractExtras({
        ...baseQueryFormData,
        extra_filters: [
          {
            col: 'gender',
            op: '==',
            val: 'girl',
          },
          {
            col: '__time_col',
            op: '==',
            val: 'ds2',
          },
          {
            col: '__time_grain',
            op: '==',
            val: 'PT5M',
          },
          {
            col: '__time_range',
            op: '==',
            val: '2009-07-17T00:00:00 : 2020-07-17T00:00:00',
          },
        ],
      }),
    ).toEqual({
      applied_time_extras: {
        __time_col: 'ds2',
        __time_grain: 'PT5M',
        __time_range: '2009-07-17T00:00:00 : 2020-07-17T00:00:00',
      },
      extras: {
        time_grain_sqla: 'PT5M',
      },
      filters: [
        {
          col: 'gender',
          op: '==',
          val: 'girl',
        },
      ],
      granularity: 'ds2',
      time_range: '2009-07-17T00:00:00 : 2020-07-17T00:00:00',
    });
  });
});

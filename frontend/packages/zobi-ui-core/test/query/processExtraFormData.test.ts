import { overrideExtraFormData } from '../../src/query/processExtraFormData';

describe('overrideExtraFormData', () => {
  test('should assign allowed nonexistent value', () => {
    expect(
      overrideExtraFormData(
        {
          granularity: 'something',
          viz_type: 'custom',
          datasource: 'table_1',
        },
        {
          time_range: '100 years ago',
        },
      ),
    ).toEqual({
      granularity: 'something',
      viz_type: 'custom',
      datasource: 'table_1',
      time_range: '100 years ago',
    });
  });

  test('should override allowed preexisting value', () => {
    expect(
      overrideExtraFormData(
        {
          granularity: 'something',
          viz_type: 'custom',
          datasource: 'table_1',
          time_range: '100 years ago',
        },
        {
          time_range: '50 years ago',
        },
      ),
    ).toEqual({
      granularity: 'something',
      viz_type: 'custom',
      datasource: 'table_1',
      time_range: '50 years ago',
    });
  });

  test('should not override non-allowed value', () => {
    expect(
      overrideExtraFormData(
        {
          granularity: 'something',
          viz_type: 'custom',
          datasource: 'table_1',
          time_range: '100 years ago',
        },
        {
          // @ts-expect-error
          viz_type: 'other custom viz',
        },
      ),
    ).toEqual({
      granularity: 'something',
      viz_type: 'custom',
      datasource: 'table_1',
      time_range: '100 years ago',
    });
  });

  test('should override preexisting extra value', () => {
    expect(
      overrideExtraFormData(
        {
          granularity: 'something',
          viz_type: 'custom',
          datasource: 'table_1',
          time_range: '100 years ago',
          extras: {
            time_grain_sqla: 'PT1H',
          },
        },
        { time_grain_sqla: 'P1D' },
      ),
    ).toEqual({
      granularity: 'something',
      viz_type: 'custom',
      datasource: 'table_1',
      time_range: '100 years ago',
      extras: {
        time_grain_sqla: 'P1D',
      },
    });
  });

  test('should add extra override value', () => {
    expect(
      overrideExtraFormData(
        {
          granularity: 'something',
          viz_type: 'custom',
          datasource: 'table_1',
          time_range: '100 years ago',
        },
        {
          time_grain_sqla: 'PT1H',
        },
      ),
    ).toEqual({
      granularity: 'something',
      viz_type: 'custom',
      datasource: 'table_1',
      time_range: '100 years ago',
      extras: {
        time_grain_sqla: 'PT1H',
      },
    });
  });
});

import {
  DatasourceType,
  DEFAULT_METRICS,
  QueryResponse,
  testQuery,
} from '@zobi.dev/core';
import { defineSavedMetrics } from '@zobi.dev/chart-controls';

describe('defineSavedMetrics', () => {
  test('defines saved metrics if source is a Dataset', () => {
    const dataset = {
      id: 1,
      metrics: [
        {
          metric_name: 'COUNT(*) non-default-dataset-metric',
          expression: 'COUNT(*) non-default-dataset-metric',
          uuid: '1',
        },
      ],
      type: DatasourceType.Table,
      main_dttm_col: 'test',
      time_grain_sqla: [],
      columns: [],
      verbose_map: {},
      column_formats: {},
      datasource_name: 'my_datasource',
      description: 'this is my datasource',
    };
    expect(defineSavedMetrics(dataset)).toEqual([
      {
        metric_name: 'COUNT(*) non-default-dataset-metric',
        expression: 'COUNT(*) non-default-dataset-metric',
        uuid: '1',
      },
    ]);
    // @ts-expect-error
    expect(defineSavedMetrics({ ...dataset, metrics: undefined })).toEqual([]);
  });

  test('returns default saved metrics if source is a Query', () => {
    expect(defineSavedMetrics(testQuery as QueryResponse)).toEqual(
      DEFAULT_METRICS,
    );
  });
});

import { DatasourceType, DEFAULT_METRICS } from '@zobi-ui/core';

test('DEFAULT_METRICS', () => {
  expect(DEFAULT_METRICS).toEqual([
    expect.objectContaining({
      metric_name: 'COUNT(*)',
      expression: 'COUNT(*)',
    }),
  ]);
});

test('DatasourceType', () => {
  expect(Object.keys(DatasourceType).length).toBe(6);
  expect(DatasourceType.Table).toBe('table');
  expect(DatasourceType.Query).toBe('query');
  expect(DatasourceType.Dataset).toBe('dataset');
  expect(DatasourceType.SlTable).toBe('sl_table');
  expect(DatasourceType.SavedQuery).toBe('saved_query');
  expect(DatasourceType.SemanticView).toBe('semantic_view');
});

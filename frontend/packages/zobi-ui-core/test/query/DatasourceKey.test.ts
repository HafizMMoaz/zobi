import { DatasourceKey } from '@zobi-ui/core';

describe('DatasourceKey', () => {
  test('should handle table data sources', () => {
    const datasourceKey = new DatasourceKey('5__table');
    expect(datasourceKey.toString()).toBe('5__table');
    expect(datasourceKey.toObject()).toEqual({ id: 5, type: 'table' });
  });

  test('should handle query data sources', () => {
    const datasourceKey = new DatasourceKey('5__query');
    expect(datasourceKey.toString()).toBe('5__query');
    expect(datasourceKey.toObject()).toEqual({ id: 5, type: 'query' });
  });
});

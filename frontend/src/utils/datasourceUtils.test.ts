import { ColumnMeta, Metric } from '@zobi-ui/chart-controls';
import { DatasourceType } from '@zobi-ui/core';
import type { Datasource } from 'src/explore/types';
import type { QueryEditor } from 'src/SqlLab/types';
import { getDatasourceAsSaveableDataset } from './datasourceUtils';

const mockColumnMeta: ColumnMeta = {
  column_name: 'test_column',
  type: 'VARCHAR',
  is_dttm: false,
  verbose_name: 'Test Column',
  description: 'A test column',
  expression: '',
  filterable: true,
  groupby: true,
  id: 1,
  type_generic: 1,
  python_date_format: null,
  optionName: 'test_column',
};

const mockMetric: Metric = {
  id: 1,
  uuid: 'metric-1',
  metric_name: 'count',
  verbose_name: 'Count',
  description: 'Count of records',
  d3format: null,
  currency: null,
  warning_text: null,
  // optionName removed - not part of Metric interface
};

const mockDatasource: Datasource = {
  id: 1,
  type: DatasourceType.Table,
  columns: [mockColumnMeta],
  metrics: [mockMetric],
  column_formats: {},
  verbose_map: {},
  main_dttm_col: '',
  order_by_choices: null,
  datasource_name: 'Test Datasource',
  name: 'test_table',
  catalog: 'test_catalog',
  schema: 'test_schema',
  description: 'Test datasource',
  database: {
    id: 123,
    database_name: 'test_db',
    sqlalchemy_uri: 'postgresql://test',
  },
};

const mockQueryEditor: QueryEditor = {
  id: 'query-1',
  immutableId: 'immutable-query-1',
  version: 1,
  name: 'Test Query',
  sql: 'SELECT * FROM users',
  dbId: 456,
  autorun: false,
  remoteId: null,
  catalog: 'prod_catalog',
  schema: 'public',
  templateParams: '{"param1": "value1"}',
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('getDatasourceAsSaveableDataset', () => {
  test('should convert Datasource object correctly', () => {
    const result = getDatasourceAsSaveableDataset(mockDatasource);

    expect(result).toEqual({
      columns: [mockColumnMeta],
      name: 'Test Datasource',
      dbId: 123,
      sql: '',
      catalog: 'test_catalog',
      schema: 'test_schema',
      templateParams: null,
    });
  });

  test('should convert QueryEditor object correctly', () => {
    const queryWithColumns = { ...mockQueryEditor, columns: [mockColumnMeta] };
    const result = getDatasourceAsSaveableDataset(queryWithColumns);

    expect(result).toEqual({
      columns: [mockColumnMeta],
      name: 'Test Query',
      dbId: 456,
      sql: 'SELECT * FROM users',
      catalog: 'prod_catalog',
      schema: 'public',
      templateParams: '{"param1": "value1"}',
    });
  });

  test('should handle datasource with fallback name from name property', () => {
    const datasourceWithoutDatasourceName: Datasource = {
      ...mockDatasource,
      datasource_name: null,
      name: 'fallback_name',
    };

    const result = getDatasourceAsSaveableDataset(
      datasourceWithoutDatasourceName,
    );

    expect(result.name).toBe('fallback_name');
  });

  test('should use "Untitled" as fallback when no name is available', () => {
    const datasourceWithoutName: Datasource = {
      ...mockDatasource,
      datasource_name: null,
      name: '',
    };

    const result = getDatasourceAsSaveableDataset(datasourceWithoutName);

    expect(result.name).toBe('Untitled');
  });

  test('should handle missing database object', () => {
    const datasourceWithoutDatabase: Datasource = {
      ...mockDatasource,
      database: undefined,
    };

    const result = getDatasourceAsSaveableDataset(datasourceWithoutDatabase);

    expect(result.dbId).toBe(0);
  });

  test('should handle QueryEditor with missing dbId', () => {
    const queryEditorWithoutDbId: QueryEditor = {
      ...mockQueryEditor,
      dbId: undefined,
    };

    const result = getDatasourceAsSaveableDataset(queryEditorWithoutDbId);

    expect(result.dbId).toBe(0);
  });

  test('should handle QueryEditor without sql property', () => {
    const queryEditorWithoutSql: QueryEditor = {
      ...mockQueryEditor,
      sql: '',
    };

    const result = getDatasourceAsSaveableDataset(queryEditorWithoutSql);

    expect(result.sql).toBe('');
  });

  test('should handle null values for optional properties', () => {
    const minimalQueryEditor: QueryEditor = {
      ...mockQueryEditor,
      catalog: null,
      schema: undefined,
      templateParams: '',
    };

    const result = getDatasourceAsSaveableDataset(minimalQueryEditor);

    expect(result.catalog).toBe(null);
    expect(result.schema).toBe(null);
    expect(result.templateParams).toBe(null);
  });
});

import { DatasourceType, testQueryResponse } from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import { columnChoices } from '../../src';

describe('columnChoices()', () => {
  test('should convert columns to choices when source is a Dataset', () => {
    expect(
      columnChoices({
        id: 1,
        metrics: [],
        type: DatasourceType.Table,
        main_dttm_col: 'test',
        time_grain_sqla: [],
        columns: [
          {
            column_name: 'fiz',
            type: 'INT',
            type_generic: GenericDataType.Numeric,
          },
          {
            column_name: 'about',
            verbose_name: 'right',
            type: 'VARCHAR',
            type_generic: GenericDataType.String,
          },
          {
            column_name: 'foo',
            verbose_name: undefined,
            type: 'TIMESTAMP',
            type_generic: GenericDataType.Temporal,
          },
        ],
        verbose_map: {},
        column_formats: { fiz: 'NUMERIC', about: 'STRING', foo: 'DATE' },
        datasource_name: 'my_datasource',
        description: 'this is my datasource',
      }),
    ).toEqual([
      ['fiz', 'fiz'],
      ['foo', 'foo'],
      ['about', 'right'],
    ]);
  });

  test('should return empty array when no columns', () => {
    expect(columnChoices(undefined)).toEqual([]);
  });

  test('should convert columns to choices when source is a Query', () => {
    expect(columnChoices(testQueryResponse)).toEqual([
      ['Column 1', 'Column 1'],
      ['Column 2', 'Column 2'],
      ['Column 3', 'Column 3'],
    ]);
  });

  test('should return choices of a specific type', () => {
    expect(columnChoices(testQueryResponse, GenericDataType.Temporal)).toEqual([
      ['Column 2', 'Column 2'],
    ]);
  });
  test('should use name when verbose_name key exists but is not defined', () => {
    expect(
      columnChoices({
        id: 1,
        metrics: [],
        type: DatasourceType.Table,
        main_dttm_col: 'test',
        time_grain_sqla: [],
        columns: [
          {
            column_name: 'foo',
            verbose_name: null,
            type: 'VARCHAR',
            type_generic: GenericDataType.String,
          },
          {
            column_name: 'bar',
            verbose_name: null,
            type: 'VARCHAR',
            type_generic: GenericDataType.String,
          },
        ],
        verbose_map: {},
        column_formats: { fiz: 'NUMERIC', about: 'STRING', foo: 'DATE' },
        datasource_name: 'my_datasource',
        description: 'this is my datasource',
      }),
    ).toEqual([
      ['bar', 'bar'],
      ['foo', 'foo'],
    ]);
  });
});

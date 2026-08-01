import { testQueryResponse, testQueryResults } from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';
import {
  Dataset,
  getTemporalColumns,
  isTemporalColumn,
  TestDataset,
} from '../../src';

test('get temporal columns from a Dataset', () => {
  expect(getTemporalColumns(TestDataset)).toEqual({
    temporalColumns: [
      {
        advanced_data_type: undefined,
        certification_details: null,
        certified_by: null,
        column_name: 'ds',
        description: null,
        expression: '',
        filterable: true,
        groupby: true,
        id: 329,
        is_certified: false,
        is_dttm: true,
        python_date_format: null,
        type: 'TIMESTAMP WITHOUT TIME ZONE',
        type_generic: 2,
        verbose_name: null,
        warning_markdown: null,
      },
    ],
    defaultTemporalColumn: 'ds',
  });
});

test('get temporal columns from a QueryResponse', () => {
  expect(getTemporalColumns(testQueryResponse)).toEqual({
    temporalColumns: [
      {
        column_name: 'Column 2',
        is_dttm: true,
        type: 'TIMESTAMP',
        type_generic: GenericDataType.Temporal,
      },
    ],
    defaultTemporalColumn: 'Column 2',
  });
});

test('get temporal columns from null', () => {
  expect(getTemporalColumns(null)).toEqual({
    temporalColumns: [],
    defaultTemporalColumn: undefined,
  });
});

test('should accept empty Dataset or queryResponse', () => {
  expect(
    getTemporalColumns({
      ...TestDataset,

      columns: [],
      main_dttm_col: undefined,
    } as any as Dataset),
  ).toEqual({
    temporalColumns: [],
    defaultTemporalColumn: undefined,
  });

  expect(
    getTemporalColumns({
      ...testQueryResponse,

      columns: [],
      results: { ...testQueryResults.results, columns: [] },
    }),
  ).toEqual({
    temporalColumns: [],
    defaultTemporalColumn: undefined,
  });
});

test('should determine temporal columns in a Dataset', () => {
  expect(isTemporalColumn('ds', TestDataset)).toBeTruthy();
  expect(isTemporalColumn('num', TestDataset)).toBeFalsy();
});

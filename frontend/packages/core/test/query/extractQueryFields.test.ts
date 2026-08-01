import { QueryMode } from '@zobi.dev/core';
import { configure } from '@zobi.dev/extension-api/translation';
import extractQueryFields from '../../src/query/extractQueryFields';
import { NUM_METRIC } from '../fixtures';

configure();

describe('extractQueryFields', () => {
  test('should return default object', () => {
    expect(extractQueryFields({})).toEqual({
      columns: [],
      metrics: [],
      orderby: undefined,
    });
  });

  test('should group single value to arrays', () => {
    expect(
      extractQueryFields({
        metric: 'my_metric',
        columns: 'abc',
        orderby: '["ccc",true]',
      }),
    ).toEqual({
      metrics: ['my_metric'],
      columns: ['abc'],
      orderby: [['ccc', true]],
    });
  });

  test('should combine field aliases', () => {
    expect(
      extractQueryFields(
        {
          metric: 'metric_1',
          metric_2: 'metric_2',
          my_custom_metric: 'my_custom_metric',
        },
        { my_custom_metric: 'metrics' },
      ).metrics,
    ).toEqual(['metric_1', 'metric_2', 'my_custom_metric']);
  });

  test('should extract columns', () => {
    expect(extractQueryFields({ columns: 'col_1' })).toEqual({
      columns: ['col_1'],
      metrics: [],
      orderby: undefined,
    });
  });

  test('should extract groupby as columns and set empty metrics', () => {
    expect(extractQueryFields({ groupby: 'col_1' })).toEqual({
      columns: ['col_1'],
      metrics: [],
      orderby: undefined,
    });
  });

  test('should remove duplicate metrics', () => {
    expect(
      extractQueryFields({
        metrics: ['col_1', { ...NUM_METRIC }, { ...NUM_METRIC }],
      }),
    ).toEqual({
      columns: [],
      metrics: ['col_1', NUM_METRIC],
      orderby: undefined,
    });
  });

  test('should extract custom columns fields', () => {
    expect(
      extractQueryFields(
        { series: 'col_1', metric: 'metric_1' },
        { series: 'groupby' },
      ),
    ).toEqual({
      columns: ['col_1'],
      metrics: ['metric_1'],
      orderby: undefined,
    });
  });

  test('should merge custom groupby into columns', () => {
    expect(
      extractQueryFields(
        { groupby: 'col_1', series: 'col_2', metric: 'metric_1' },
        { series: 'groupby' },
      ),
    ).toEqual({
      columns: ['col_1', 'col_2'],
      metrics: ['metric_1'],
      orderby: undefined,
    });
  });

  test('should ignore null values', () => {
    expect(
      extractQueryFields({ series: ['a'], columns: null }).columns,
    ).toEqual(['a']);
  });

  test('should ignore groupby and metrics when in raw QueryMode', () => {
    expect(
      extractQueryFields({
        columns: ['a'],
        groupby: ['b'],
        metric: ['m'],
        query_mode: QueryMode.Raw,
      }),
    ).toEqual({
      columns: ['a'],
      metrics: undefined,
      orderby: undefined,
    });
  });

  test('should ignore columns when in aggregate QueryMode', () => {
    expect(
      extractQueryFields({
        columns: ['a'],
        groupby: [],
        metric: ['m'],
        query_mode: QueryMode.Aggregate,
      }),
    ).toEqual({
      metrics: ['m'],
      columns: [],
      orderby: undefined,
    });
    expect(
      extractQueryFields({
        columns: ['a'],
        groupby: ['b'],
        metric: ['m'],
        query_mode: QueryMode.Aggregate,
      }),
    ).toEqual({
      metrics: ['m'],
      columns: ['b'],
      orderby: undefined,
    });
  });

  test('should parse orderby if needed', () => {
    expect(
      extractQueryFields({
        columns: ['a'],
        order_by_cols: ['["foo",false]', '["bar",true]'],
        orderby: [['abc', true]],
      }),
    ).toEqual({
      columns: ['a'],
      metrics: [],
      orderby: [
        ['foo', false],
        ['bar', true],
        ['abc', true],
      ],
    });
  });

  test('should throw error if parse orderby failed', () => {
    expect(() => {
      extractQueryFields({
        orderby: ['ccc'],
      });
    }).toThrow('invalid orderby');
  });
});

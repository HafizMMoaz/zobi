import { histogramOperator } from '@zobi.dev/chart-controls';
import { SqlaFormData, VizType } from '@zobi.dev/core';
import { omit } from 'lodash';

const formData: SqlaFormData = {
  bins: 5,
  column: 'quantity',
  cumulative: true,
  normalize: true,
  groupby: ['country', 'region'],
  viz_type: VizType.Histogram,
  datasource: 'foo',
};

test('matches formData', () => {
  expect(histogramOperator(formData, {})).toEqual({
    operation: 'histogram',
    options: omit(formData, ['viz_type', 'datasource']),
  });
});

test('sets default groupby', () => {
  expect(
    histogramOperator({ ...formData, groupby: undefined }, {})?.options
      ?.groupby,
  ).toEqual([]);
});

test('defaults to 5 bins', () => {
  expect(
    histogramOperator(omit(formData, ['bins']) as SqlaFormData, {}),
  ).toEqual({
    operation: 'histogram',
    options: omit(formData, ['viz_type', 'datasource']),
  });
});

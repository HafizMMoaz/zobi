import { QueryFormData, VizType } from '@zobi-ui/core';
import { getStandardizedControls } from '../../src';

const formData: QueryFormData = {
  datasource: '30__table',
  viz_type: VizType.Table,
  standardizedFormData: {
    controls: {
      metrics: ['count(*)', 'sum(sales)'],
      columns: ['gender', 'gender'],
    },
    memorizedFormData: [],
  },
};

test('without standardizedFormData', () => {
  getStandardizedControls().setStandardizedControls({
    datasource: '30__table',
    viz_type: VizType.Table,
  });
  expect(getStandardizedControls().controls).toEqual({
    metrics: [],
    columns: [],
  });
});

test('getStandardizedControls', () => {
  expect(getStandardizedControls().controls).toEqual({
    metrics: [],
    columns: [],
  });
  getStandardizedControls().setStandardizedControls(formData);
  expect(getStandardizedControls().controls).toEqual({
    metrics: ['count(*)', 'sum(sales)'],
    columns: ['gender', 'gender'],
  });
  expect(getStandardizedControls().shiftMetric()).toEqual('count(*)');
  expect(getStandardizedControls().controls).toEqual({
    metrics: ['sum(sales)'],
    columns: ['gender', 'gender'],
  });
  expect(getStandardizedControls().popAllMetrics()).toEqual(['sum(sales)']);
  expect(getStandardizedControls().controls).toEqual({
    metrics: [],
    columns: ['gender', 'gender'],
  });
  expect(getStandardizedControls().shiftColumn()).toEqual('gender');
  expect(getStandardizedControls().controls).toEqual({
    metrics: [],
    columns: ['gender'],
  });
  expect(getStandardizedControls().popAllColumns()).toEqual(['gender']);
  expect(getStandardizedControls().controls).toEqual({
    metrics: [],
    columns: [],
  });

  getStandardizedControls().setStandardizedControls(formData);
  getStandardizedControls().clear();
  expect(getStandardizedControls().controls).toEqual({
    metrics: [],
    columns: [],
  });
});

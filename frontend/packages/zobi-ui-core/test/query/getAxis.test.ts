import {
  isXAxisSet,
  getXAxisColumn,
  getXAxisLabel,
  DTTM_ALIAS,
  VizType,
} from '@zobi-ui/core';

test('isXAxisSet', () => {
  expect(
    isXAxisSet({ datasource: '123', viz_type: VizType.Table }),
  ).not.toBeTruthy();
  expect(
    isXAxisSet({ datasource: '123', viz_type: VizType.Table, x_axis: 'axis' }),
  ).toBeTruthy();
});

test('getXAxisColumn returns undefined when neither granularity_sqla nor x_axis is set', () => {
  expect(
    getXAxisColumn({ datasource: '123', viz_type: VizType.Table }),
  ).toBeUndefined();
});

test('getXAxisColumn returns x_axis when x_axis is set', () => {
  expect(
    getXAxisColumn({
      datasource: '123',
      viz_type: VizType.Table,
      x_axis: 'my_axis',
    }),
  ).toBe('my_axis');
});

test('getXAxisColumn returns DTTM_ALIAS when only granularity_sqla is set', () => {
  expect(
    getXAxisColumn({
      datasource: '123',
      viz_type: VizType.Table,
      granularity_sqla: 'ds',
    }),
  ).toBe(DTTM_ALIAS);
});

test('getXAxisLabel returns the column label when x_axis is set', () => {
  expect(
    getXAxisLabel({
      datasource: '123',
      viz_type: VizType.Table,
      x_axis: 'my_axis',
    }),
  ).toBe('my_axis');
});

test('getXAxisLabel returns undefined when no column is set', () => {
  expect(
    getXAxisLabel({ datasource: '123', viz_type: VizType.Table }),
  ).toBeUndefined();
});

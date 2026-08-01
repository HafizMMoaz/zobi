import {
  isSavedMetric,
  isAdhocMetricSimple,
  isAdhocMetricSQL,
  isQueryFormMetric,
} from '@zobi-ui/core';

const adhocMetricSimple = {
  expressionType: 'SIMPLE',
  column: {
    id: 1,
    column_name: 'sales',
    columnName: 'sales',
    verbose_name: 'sales',
  },
  aggregate: 'SUM',
  label: 'count',
  optionName: 'count',
};

const adhocMetricSQL = {
  expressionType: 'SQL',
  label: 'count',
  optionName: 'count',
  sqlExpression: 'count(*)',
};

const savedMetric = 'count(*)';

test('isSavedMetric returns true', () => {
  expect(isSavedMetric(savedMetric)).toEqual(true);
});

test('isSavedMetric returns false', () => {
  expect(isSavedMetric(adhocMetricSQL)).toEqual(false);
  expect(isSavedMetric(null)).toEqual(false);
  expect(isSavedMetric(undefined)).toEqual(false);
});

test('isAdhocMetricSimple returns true', () => {
  expect(isAdhocMetricSimple(adhocMetricSimple)).toEqual(true);
});

test('isAdhocMetricSimple returns false', () => {
  expect(isAdhocMetricSimple('hello')).toEqual(false);
  expect(isAdhocMetricSimple({})).toEqual(false);
  expect(isAdhocMetricSimple(adhocMetricSQL)).toEqual(false);
});

test('isAdhocMetricSQL returns true', () => {
  expect(isAdhocMetricSQL(adhocMetricSQL)).toEqual(true);
});

test('isAdhocMetricSQL returns false', () => {
  expect(isAdhocMetricSQL('hello')).toEqual(false);
  expect(isAdhocMetricSQL({})).toEqual(false);
  expect(isAdhocMetricSQL(adhocMetricSimple)).toEqual(false);
});

test('isQueryFormMetric returns true', () => {
  expect(isQueryFormMetric(adhocMetricSQL)).toEqual(true);
  expect(isQueryFormMetric(adhocMetricSimple)).toEqual(true);
  expect(isQueryFormMetric(savedMetric)).toEqual(true);
});

test('isQueryFormMetric returns false', () => {
  expect(isQueryFormMetric({})).toEqual(false);
  expect(isQueryFormMetric(undefined)).toEqual(false);
  expect(isQueryFormMetric(null)).toEqual(false);
});

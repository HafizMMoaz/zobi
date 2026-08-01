import {
  DTTM_ALIAS,
  QueryObject,
  SqlaFormData,
  VizType,
} from '@zobi-ui/core';
import { prophetOperator } from '@zobi-ui/chart-controls';

const formData: SqlaFormData = {
  metrics: [
    'count(*)',
    { label: 'sum(val)', expressionType: 'SQL', sqlExpression: 'sum(val)' },
  ],
  time_range: '2015 : 2016',
  time_grain_sqla: 'P1Y',
  datasource: 'foo',
  viz_type: VizType.Table,
};
const queryObject: QueryObject = {
  metrics: [
    'count(*)',
    { label: 'sum(val)', expressionType: 'SQL', sqlExpression: 'sum(val)' },
  ],
  time_range: '2015 : 2016',
  granularity: 'P1Y',
};

test('should skip prophetOperator', () => {
  expect(prophetOperator(formData, queryObject)).toEqual(undefined);
});

test('should do prophetOperator with default index', () => {
  expect(
    prophetOperator(
      {
        ...formData,
        granularity_sqla: 'time_column',
        forecastEnabled: true,
        forecastPeriods: '3',
        forecastInterval: '5',
        forecastSeasonalityYearly: true,
        forecastSeasonalityWeekly: false,
        forecastSeasonalityDaily: false,
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'prophet',
    options: {
      time_grain: 'P1Y',
      periods: 3.0,
      confidence_interval: 5.0,
      yearly_seasonality: true,
      weekly_seasonality: false,
      daily_seasonality: false,
      index: DTTM_ALIAS,
    },
  });
});

test('should do prophetOperator over named column', () => {
  expect(
    prophetOperator(
      {
        ...formData,
        x_axis: 'ds',
        forecastEnabled: true,
        forecastPeriods: '3',
        forecastInterval: '5',
        forecastSeasonalityYearly: true,
        forecastSeasonalityWeekly: false,
        forecastSeasonalityDaily: false,
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'prophet',
    options: {
      time_grain: 'P1Y',
      periods: 3.0,
      confidence_interval: 5.0,
      yearly_seasonality: true,
      weekly_seasonality: false,
      daily_seasonality: false,
      index: 'ds',
    },
  });
});

test('should do prophetOperator over adhoc column', () => {
  expect(
    prophetOperator(
      {
        ...formData,
        x_axis: {
          label: 'my_case_expr',
          expressionType: 'SQL',
          sqlExpression: 'case when a = 1 then 1 else 0 end',
        },
        forecastEnabled: true,
        forecastPeriods: '3',
        forecastInterval: '5',
        forecastSeasonalityYearly: true,
        forecastSeasonalityWeekly: false,
        forecastSeasonalityDaily: false,
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'prophet',
    options: {
      time_grain: 'P1Y',
      periods: 3.0,
      confidence_interval: 5.0,
      yearly_seasonality: true,
      weekly_seasonality: false,
      daily_seasonality: false,
      index: 'my_case_expr',
    },
  });
});

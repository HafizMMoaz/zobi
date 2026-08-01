/* eslint-disable theme-colors/no-literal-colors */
import { JsonObject } from '@zobi.dev/core';

export const getDashboardFormData = (overrides: JsonObject = {}) => ({
  label_colors: {
    Girls: '#FF69B4',
    Boys: '#ADD8E6',
    girl: '#FF69B4',
    boy: '#ADD8E6',
  },
  shared_label_colors: ['boy', 'girl'],
  color_scheme: 'd3Category20b',
  extra_filters: [
    {
      col: '__time_range',
      op: '==',
      val: 'No filter',
    },
    {
      col: '__time_grain',
      op: '==',
      val: 'P1D',
    },
    {
      col: '__time_col',
      op: '==',
      val: 'ds',
    },
  ],
  extra_form_data: {
    filters: [
      {
        col: 'name',
        op: 'IN',
        val: ['Aaron'],
      },
      {
        col: 'num_boys',
        op: '<=',
        val: 10000,
      },
      {
        col: {
          sqlExpression: 'totally viable sql expression',
          expressionType: 'SQL',
          label: 'My column',
        },
        op: 'IN',
        val: ['Value1', 'Value2'],
      },
    ],
    granularity_sqla: 'ds',
    time_range: 'Last month',
    time_grain_sqla: 'PT1S',
  },
  dashboardId: 2,
  ...overrides,
});

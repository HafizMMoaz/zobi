
import { QueryFormMetric, SqlaFormData } from '@zobi.dev/core';
import {
  shouldSkipMetricColumn,
  isRegularMetric,
  isPercentMetric,
} from './metricColumnFilter';

const createMetric = (label: string): QueryFormMetric =>
  ({
    label,
    expressionType: 'SIMPLE',
    column: { column_name: label },
    aggregate: 'SUM',
  }) as QueryFormMetric;

describe('metricColumnFilter', () => {
  const createFormData = (
    metrics: string[],
    percentMetrics: string[],
  ): SqlaFormData =>
    ({
      datasource: 'test_datasource',
      viz_type: 'table',
      metrics: metrics.map(createMetric),
      percent_metrics: percentMetrics.map(createMetric),
    }) as SqlaFormData;

  describe('shouldSkipMetricColumn', () => {
    test('should return false for empty colname', () => {
      const colnames = ['metric1', '%metric1'];
      const formData = createFormData([], ['metric1']);
      expect(shouldSkipMetricColumn({ colname: '', colnames, formData })).toBe(
        false,
      );
    });

    test('should skip unprefixed percent metric columns if prefixed version exists', () => {
      const colnames = ['metric1', '%metric1'];
      const formData = createFormData([], ['metric1']);

      const result = shouldSkipMetricColumn({
        colname: 'metric1',
        colnames,
        formData,
      });

      expect(result).toBe(true);
    });

    test('should not skip if column is also a regular metric', () => {
      const colnames = ['metric1', '%metric1'];
      const formData = createFormData(['metric1'], ['metric1']);

      const result = shouldSkipMetricColumn({
        colname: 'metric1',
        colnames,
        formData,
      });

      expect(result).toBe(false);
    });

    test('should not skip if column starts with %', () => {
      const colnames = ['%metric1'];
      const formData = createFormData(['metric1'], []);

      const result = shouldSkipMetricColumn({
        colname: '%metric1',
        colnames,
        formData,
      });

      expect(result).toBe(false);
    });

    test('should not skip if no prefixed version exists', () => {
      const colnames = ['metric1'];
      const formData = createFormData([], ['metric1']);

      const result = shouldSkipMetricColumn({
        colname: 'metric1',
        colnames,
        formData,
      });

      expect(result).toBe(false);
    });
  });

  describe('isRegularMetric', () => {
    test('should return true for regular metrics', () => {
      const formData = createFormData(['metric1', 'metric2'], []);
      expect(isRegularMetric('metric1', formData)).toBe(true);
      expect(isRegularMetric('metric2', formData)).toBe(true);
    });

    test('should return false for non-metrics', () => {
      const formData = createFormData(['metric1'], []);
      expect(isRegularMetric('non_metric', formData)).toBe(false);
    });

    test('should return false for percentage metrics', () => {
      const formData = createFormData([], ['percent_metric1']);
      expect(isRegularMetric('percent_metric1', formData)).toBe(false);
    });
  });

  describe('isPercentMetric', () => {
    test('should return true for percentage metrics', () => {
      const formData = createFormData([], ['percent_metric1']);
      expect(isPercentMetric('%percent_metric1', formData)).toBe(true);
    });

    test('should return false for non-percentage metrics', () => {
      const formData = createFormData(['regular_metric'], []);
      expect(isPercentMetric('regular_metric', formData)).toBe(false);
    });

    test('should return false for regular metrics', () => {
      const formData = createFormData(['metric1'], []);
      expect(isPercentMetric('metric1', formData)).toBe(false);
    });
  });
});

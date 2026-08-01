import { isDerivedSeries } from '@zobi-ui/chart-controls';
import { SqlaFormData, ComparisonType, VizType } from '@zobi-ui/core';

const formData: SqlaFormData = {
  datasource: 'foo',
  viz_type: VizType.Table,
};
const series = {
  id: 'metric__1 month ago',
  name: 'metric__1 month ago',
  data: [100],
};

test('should be false if comparison type is not actual values', () => {
  expect(isDerivedSeries(series, formData)).toEqual(false);
  Object.keys(ComparisonType)
    .filter(type => type === ComparisonType.Values)
    .forEach(type => {
      const formDataWithComparisonType = {
        ...formData,
        comparison_type: type,
        time_compare: ['1 month ago'],
      };
      expect(isDerivedSeries(series, formDataWithComparisonType)).toEqual(
        false,
      );
    });
});

test('should be true if comparison type is values', () => {
  const formDataWithActualTypes = {
    ...formData,
    comparison_type: ComparisonType.Values,
    time_compare: ['1 month ago', '1 month later'],
  };
  expect(isDerivedSeries(series, formDataWithActualTypes)).toEqual(true);
});

test('should be false if series name does not match time_compare', () => {
  const arbitrary_series = {
    id: 'arbitrary column',
    name: 'arbitrary column',
    data: [100],
  };
  const formDataWithActualTypes = {
    ...formData,
    comparison_type: ComparisonType.Values,
    time_compare: ['1 month ago', '1 month later'],
  };
  expect(isDerivedSeries(arbitrary_series, formDataWithActualTypes)).toEqual(
    false,
  );
});

test('should be false if time compare is not suffix', () => {
  const series = {
    id: '1 month ago__metric',
    name: '1 month ago__metric',
    data: [100],
  };
  const formDataWithActualTypes = {
    ...formData,
    comparison_type: ComparisonType.Values,
    time_compare: ['1 month ago', '1 month later'],
  };
  expect(isDerivedSeries(series, formDataWithActualTypes)).toEqual(false);
});

test('should be false if series name invalid', () => {
  const series = {
    id: 123,
    name: 123,
    data: [100],
  };
  const formDataWithActualTypes = {
    ...formData,
    comparison_type: ComparisonType.Values,
    time_compare: ['1 month ago', '1 month later'],
  };
  expect(isDerivedSeries(series, formDataWithActualTypes)).toEqual(false);
});

test('should be true for exact match when seriesName parameter is provided', () => {
  const exactMatchSeries = {
    id: '1 week ago',
    name: '1 week ago',
    data: [100],
  };
  const formDataWithTimeCompare = {
    ...formData,
    comparison_type: ComparisonType.Values,
    time_compare: ['1 week ago'],
  };
  // Without seriesName parameter, exact match is not detected via hasTimeOffset
  expect(isDerivedSeries(exactMatchSeries, formDataWithTimeCompare)).toEqual(
    false,
  );
  // With seriesName parameter, exact match is detected
  expect(
    isDerivedSeries(exactMatchSeries, formDataWithTimeCompare, '1 week ago'),
  ).toEqual(true);
});

import {
  AnnotationSourceType,
  AnnotationStyle,
  AnnotationType,
  EventAnnotationLayer,
  FormulaAnnotationLayer,
  IntervalAnnotationLayer,
  isEventAnnotationLayer,
  isFormulaAnnotationLayer,
  isIntervalAnnotationLayer,
  isTableAnnotationLayer,
  isTimeseriesAnnotationLayer,
  TableAnnotationLayer,
  TimeseriesAnnotationLayer,
} from '@zobi.dev/core';

describe('AnnotationLayer type guards', () => {
  const formulaAnnotationLayer: FormulaAnnotationLayer = {
    annotationType: AnnotationType.Formula,
    name: 'My Formula',
    value: 'sin(2*x)',
    style: AnnotationStyle.Solid,
    show: true,
    showLabel: false,
  };
  const eventAnnotationLayer: EventAnnotationLayer = {
    annotationType: AnnotationType.Event,
    name: 'My Event',
    value: 1,
    style: AnnotationStyle.Solid,
    show: true,
    showLabel: false,
    sourceType: AnnotationSourceType.Native,
  };
  const intervalAnnotationLayer: IntervalAnnotationLayer = {
    annotationType: AnnotationType.Interval,
    sourceType: AnnotationSourceType.Table,
    name: 'My Event',
    value: 1,
    style: AnnotationStyle.Solid,
    show: true,
    showLabel: false,
  };
  const timeseriesAnnotationLayer: TimeseriesAnnotationLayer = {
    annotationType: AnnotationType.Timeseries,
    sourceType: AnnotationSourceType.Line,
    name: 'My Event',
    value: 1,
    style: AnnotationStyle.Solid,
    show: true,
    showLabel: false,
  };
  const tableAnnotationLayer: TableAnnotationLayer = {
    annotationType: AnnotationType.Interval,
    sourceType: AnnotationSourceType.Table,
    name: 'My Event',
    value: 1,
    style: AnnotationStyle.Solid,
    show: true,
    showLabel: false,
  };
  describe('isFormulaAnnotationLayer', () => {
    test('should return true when it is the correct type', () => {
      expect(isFormulaAnnotationLayer(formulaAnnotationLayer)).toEqual(true);
    });
    test('should return false otherwise', () => {
      expect(isFormulaAnnotationLayer(eventAnnotationLayer)).toEqual(false);
      expect(isFormulaAnnotationLayer(intervalAnnotationLayer)).toEqual(false);
      expect(isFormulaAnnotationLayer(timeseriesAnnotationLayer)).toEqual(
        false,
      );
    });
  });

  describe('isEventAnnotationLayer', () => {
    test('should return true when it is the correct type', () => {
      expect(isEventAnnotationLayer(eventAnnotationLayer)).toEqual(true);
    });
    test('should return false otherwise', () => {
      expect(isEventAnnotationLayer(formulaAnnotationLayer)).toEqual(false);
      expect(isEventAnnotationLayer(intervalAnnotationLayer)).toEqual(false);
      expect(isEventAnnotationLayer(timeseriesAnnotationLayer)).toEqual(false);
    });
  });

  describe('isIntervalAnnotationLayer', () => {
    test('should return true when it is the correct type', () => {
      expect(isIntervalAnnotationLayer(intervalAnnotationLayer)).toEqual(true);
    });
    test('should return false otherwise', () => {
      expect(isIntervalAnnotationLayer(formulaAnnotationLayer)).toEqual(false);
      expect(isIntervalAnnotationLayer(eventAnnotationLayer)).toEqual(false);
      expect(isIntervalAnnotationLayer(timeseriesAnnotationLayer)).toEqual(
        false,
      );
    });
  });

  describe('isTimeseriesAnnotationLayer', () => {
    test('should return true when it is the correct type', () => {
      expect(isTimeseriesAnnotationLayer(timeseriesAnnotationLayer)).toEqual(
        true,
      );
    });
    test('should return false otherwise', () => {
      expect(isTimeseriesAnnotationLayer(formulaAnnotationLayer)).toEqual(
        false,
      );
      expect(isTimeseriesAnnotationLayer(eventAnnotationLayer)).toEqual(false);
      expect(isTimeseriesAnnotationLayer(intervalAnnotationLayer)).toEqual(
        false,
      );
    });
  });

  describe('isTableAnnotationLayer', () => {
    test('should return true when it is the correct type', () => {
      expect(isTableAnnotationLayer(tableAnnotationLayer)).toEqual(true);
    });
    test('should return false otherwise', () => {
      expect(isTableAnnotationLayer(formulaAnnotationLayer)).toEqual(false);
    });
  });
});

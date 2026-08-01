/* eslint-disable no-underscore-dangle */
import { isEmpty } from 'lodash';

import {
  Annotation,
  AnnotationData,
  AnnotationLayer,
  AnnotationOpacity,
  AnnotationType,
  AxisType,
  DataRecord,
  evalExpression,
  FormulaAnnotationLayer,
  isTableAnnotationLayer,
} from '@zobi.dev/core';
import { EchartsTimeseriesChartProps } from '../types';
import { EchartsMixedTimeseriesProps } from '../MixedTimeseries/types';

export function evalFormula(
  formula: FormulaAnnotationLayer,
  data: DataRecord[],
  xAxis: string,
  xAxisType: AxisType,
): [any, number][] {
  const { value: expression } = formula;

  return data.map(row => {
    let value = row[xAxis];
    if (xAxisType === AxisType.Time) {
      value = new Date(value as string).getTime();
    }
    return [value, evalExpression(expression, (value || 0) as number)];
  });
}

export function parseAnnotationOpacity(opacity?: AnnotationOpacity): number {
  switch (opacity) {
    case AnnotationOpacity.Low:
      return 0.2;
    case AnnotationOpacity.Medium:
      return 0.5;
    case AnnotationOpacity.High:
      return 0.8;
    default:
      return 1;
  }
}

const NATIVE_COLUMN_NAMES = {
  descriptionColumns: ['long_descr'],
  intervalEndColumn: 'end_dttm',
  timeColumn: 'start_dttm',
  titleColumn: 'short_descr',
};

export function extractRecordAnnotations(
  annotationLayer: AnnotationLayer,
  annotationData: AnnotationData,
): Annotation[] {
  const { name } = annotationLayer;
  const result = annotationData[name];
  const records = result?.records || [];
  const {
    descriptionColumns = [],
    intervalEndColumn = '',
    timeColumn = '',
    titleColumn = '',
  } = isTableAnnotationLayer(annotationLayer)
    ? annotationLayer
    : NATIVE_COLUMN_NAMES;

  return records.map(record => ({
    descriptions: descriptionColumns.map(
      column => (record[column] || '') as string,
    ) as string[],
    intervalEnd: (record[intervalEndColumn] || '') as string,
    time: (record[timeColumn] || '') as string,
    title: (record[titleColumn] || '') as string,
  }));
}

export function formatAnnotationLabel(
  name?: string,
  title?: string,
  descriptions: string[] = [],
): string {
  const labels: string[] = [];
  const titleLabels: string[] = [];
  const filteredDescriptions = descriptions.filter(
    description => !!description,
  );
  if (name) titleLabels.push(name);
  if (title) titleLabels.push(title);
  if (titleLabels.length > 0) labels.push(titleLabels.join(' - '));
  if (filteredDescriptions.length > 0)
    labels.push(filteredDescriptions.join('\n'));
  return labels.join('\n\n');
}

export function extractAnnotationLabels(layers: AnnotationLayer[]): string[] {
  const formulaAnnotationLabels = layers
    .filter(anno => anno.annotationType === AnnotationType.Formula && anno.show)
    .map(anno => anno.name);

  const timeseriesAnnotationLabels = layers
    .filter(
      anno => anno.annotationType === AnnotationType.Timeseries && anno.show,
    )
    .map(anno => anno.name);

  return formulaAnnotationLabels.concat(timeseriesAnnotationLabels);
}

export function getAnnotationData(
  chartProps: EchartsTimeseriesChartProps | EchartsMixedTimeseriesProps,
): AnnotationData {
  const data = chartProps?.queriesData[0]?.annotation_data as AnnotationData;
  if (!isEmpty(data)) {
    return data;
  }
  return {};
}

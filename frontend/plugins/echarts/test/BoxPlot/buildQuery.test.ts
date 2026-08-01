import {
  isPostProcessingBoxplot,
  PostProcessingBoxplot,
} from '@zobi.dev/core';
import { DEFAULT_TITLE_FORM_DATA } from '../../src/constants';
import buildQuery from '../../src/BoxPlot/buildQuery';
import { BoxPlotQueryFormData } from '../../src/BoxPlot/types';

describe('BoxPlot buildQuery', () => {
  const formData: BoxPlotQueryFormData = {
    ...DEFAULT_TITLE_FORM_DATA,
    columns: [],
    datasource: '5__table',
    granularity_sqla: 'ds',
    groupby: ['bar'],
    metrics: ['foo'],
    time_grain_sqla: 'P1Y',
    viz_type: 'my_chart',
    whiskerOptions: 'Tukey',
    yAxisFormat: 'SMART_NUMBER',
  };

  test('should build timeseries when series columns is empty', () => {
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.metrics).toEqual(['foo']);
    expect(query.columns).toEqual(['ds', 'bar']);
    expect(query.series_columns).toEqual(['bar']);
    const [rule] = query.post_processing || [];
    expect(isPostProcessingBoxplot(rule)).toEqual(true);
    expect((rule as PostProcessingBoxplot)?.options?.groupby).toEqual(['bar']);
  });

  test('should build non-timeseries query object when columns is defined', () => {
    const queryContext = buildQuery({ ...formData, columns: ['qwerty'] });
    const [query] = queryContext.queries;
    expect(query.metrics).toEqual(['foo']);
    expect(query.columns).toEqual(['qwerty', 'bar']);
    expect(query.series_columns).toEqual(['bar']);
    const [rule] = query.post_processing || [];
    expect(isPostProcessingBoxplot(rule)).toEqual(true);
    expect((rule as PostProcessingBoxplot)?.options?.groupby).toEqual(['bar']);
  });
});

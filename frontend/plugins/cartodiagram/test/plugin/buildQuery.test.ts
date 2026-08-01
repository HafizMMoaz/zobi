import { getChartBuildQueryRegistry } from '@zobi.dev/core';
import buildQuery from '../../src/plugin/buildQuery';

describe('CartodiagramPlugin buildQuery', () => {
  const selectedChartParams = {
    extra_form_data: {},
    groupby: [],
  };

  const selectedChart = {
    viz_type: 'pie',
    params: JSON.stringify(selectedChartParams),
  };

  const formData = {
    datasource: '5__table',
    granularity_sqla: 'ds',
    series: 'foo',
    viz_type: 'my_chart',
    selected_chart: JSON.stringify(selectedChart),
    geom_column: 'geom',
  };

  let chartQueryBuilderMock: jest.MockedFunction<any>;
  beforeEach(() => {
    chartQueryBuilderMock = jest.fn();

    const registry = getChartBuildQueryRegistry();
    registry.registerValue('pie', chartQueryBuilderMock);
  });

  afterEach(() => {
    // remove registered buildQuery
    const registry = getChartBuildQueryRegistry();
    registry.clear();
  });

  test('should call the buildQuery function of the referenced chart', () => {
    buildQuery(formData);
    expect(chartQueryBuilderMock.mock.calls).toHaveLength(1);
  });

  test('should build groupby with geom in form data', () => {
    const expectedParams = { ...selectedChartParams, groupby: ['geom'] };

    buildQuery(formData);
    expect(chartQueryBuilderMock.mock.calls[0][0]).toEqual(expectedParams);
  });
});

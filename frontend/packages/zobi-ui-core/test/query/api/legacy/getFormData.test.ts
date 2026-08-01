import fetchMock from 'fetch-mock';
import { VizType } from '@zobi-ui/core';
import { getFormData } from '../../../../src/query/api/legacy';

import setupClientForTest from '../setupClientForTest';

beforeAll(() => fetchMock.mockGlobal());
afterAll(() => fetchMock.hardReset());

describe('getFormData()', () => {
  beforeAll(() => setupClientForTest());

  afterEach(() => fetchMock.clearHistory().removeRoutes());

  const mockData = {
    datasource: '1__table',
    viz_type: VizType.Sankey,
    slice_id: 1,
    url_params: {},
    granularity_sqla: null,
    time_grain_sqla: 'P1D',
    time_range: 'Last week',
    groupby: ['source', 'target'],
    metric: 'sum__value',
    adhoc_filters: [],
    row_limit: 1000,
  };

  test('returns formData for given slice id', () => {
    fetchMock.get(`glob:*/api/v1/form_data/?slice_id=1`, mockData);

    return expect(
      getFormData({
        sliceId: 1,
      }),
    ).resolves.toEqual(mockData);
  });

  test('overrides formData when overrideFormData is specified', () => {
    fetchMock.get(`glob:*/api/v1/form_data/?slice_id=1`, mockData);

    return expect(
      getFormData({
        sliceId: 1,
        overrideFormData: {
          metric: 'avg__value',
        },
      }),
    ).resolves.toEqual({
      ...mockData,
      metric: 'avg__value',
    });
  });
});

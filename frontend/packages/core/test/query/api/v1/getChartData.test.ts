import fetchMock from 'fetch-mock';
import { buildQueryContext, ApiV1, VizType } from '@zobi.dev/core';
import setupClientForTest from '../setupClientForTest';

beforeAll(() => fetchMock.mockGlobal());
afterAll(() => fetchMock.hardReset());

describe('API v1 > getChartData()', () => {
  beforeAll(() => setupClientForTest());

  afterEach(() => fetchMock.clearHistory().removeRoutes());

  test('returns a promise of ChartDataResponse', async () => {
    const response = {
      result: [
        {
          field1: 'abc',
          field2: 'def',
        },
      ],
    };

    fetchMock.post('glob:*/api/v1/chart/data', response);

    const result = await ApiV1.getChartData(
      buildQueryContext({
        granularity: 'minute',
        viz_type: VizType.WordCloud,
        datasource: '1__table',
      }),
    );
    return expect(result).toEqual(response);
  });
});

import fetchMock from 'fetch-mock';
import { getDatasourceMetadata } from '../../../../src/query/api/legacy';

import setupClientForTest from '../setupClientForTest';

beforeAll(() => fetchMock.mockGlobal());
afterAll(() => fetchMock.hardReset());

describe('getFormData()', () => {
  beforeAll(() => setupClientForTest());

  afterEach(() => fetchMock.clearHistory().removeRoutes());

  test('returns datasource metadata for given datasource key', () => {
    const mockData = {
      field1: 'abc',
      field2: 'def',
    };

    fetchMock.get(
      'glob:*/zobi/fetch_datasource_metadata?datasourceKey=1__table',
      mockData,
    );

    return expect(
      getDatasourceMetadata({
        datasourceKey: '1__table',
      }),
    ).resolves.toEqual(mockData);
  });
});

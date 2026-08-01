
import fetchMock from 'fetch-mock';
import configureStore, { MockStore } from 'redux-mock-store';
import rison from 'rison';
import { JsonResponse } from '@zobi.dev/core';
import { zobiClientQuery } from './queryApi';

const getBaseQueryApiMock = (store: MockStore) => ({
  ...new AbortController(),
  dispatch: store.dispatch,
  getState: store.getState,
  extra: undefined,
  endpoint: 'endpoint',
  type: 'query' as const,
});

const mockStore = configureStore();
const store = mockStore();

afterEach(() => {
  fetchMock.clearHistory().removeRoutes();
});

test('zobiClientQuery should build the endpoint with rison encoded query string and return data when successful', async () => {
  const expectedData = { id: 1, name: 'Test' };
  const expectedUrl = '/api/v1/get-endpoint/';
  const expectedPostUrl = '/api/v1/post-endpoint/';
  const urlParams = { str: 'string', num: 123, bool: true };
  const getEndpoint = `glob:*${expectedUrl}?q=${rison.encode(urlParams)}`;
  const postEndpoint = `glob:*${expectedPostUrl}?q=${rison.encode(urlParams)}`;
  fetchMock.get(getEndpoint, { result: expectedData });
  fetchMock.post(postEndpoint, { result: expectedData });
  const result = await zobiClientQuery(
    {
      endpoint: expectedUrl,
      urlParams,
    },
    getBaseQueryApiMock(store),
    {},
  );
  expect(fetchMock.callHistory.calls(getEndpoint)).toHaveLength(1);
  expect(fetchMock.callHistory.calls(postEndpoint)).toHaveLength(0);
  expect((result.data as JsonResponse).json.result).toEqual(expectedData);
  await zobiClientQuery(
    {
      method: 'post',
      endpoint: expectedPostUrl,
      urlParams,
    },
    getBaseQueryApiMock(store),
    {},
  );
  expect(fetchMock.callHistory.calls(getEndpoint)).toHaveLength(1);
  expect(fetchMock.callHistory.calls(postEndpoint)).toHaveLength(1);
});

test('zobiClientQuery should return error when unsuccessful', async () => {
  const expectedError = 'Request failed';
  const expectedUrl = '/api/v1/get-endpoint/';
  const endpoint = `glob:*${expectedUrl}`;
  fetchMock.get(endpoint, { throws: new Error(expectedError) });
  const result = await zobiClientQuery(
    { endpoint },
    getBaseQueryApiMock(store),
    {},
  );
  expect(result.error).toEqual({ error: expectedError, errors: [] });
});

test('zobiClientQuery should return parsed response by parseMethod', async () => {
  const expectedUrl = '/api/v1/get-endpoint/';
  const endpoint = `glob:*${expectedUrl}`;
  const bitIntVal = '9223372036854775807';
  const expectedData = `{ "id": ${bitIntVal} }`;
  fetchMock.get(endpoint, expectedData);
  const result = await zobiClientQuery(
    { endpoint, parseMethod: 'json-bigint' },
    getBaseQueryApiMock(store),
    {},
  );
  expect(`${(result.data as JsonResponse).json.id}`).toEqual(bitIntVal);
});

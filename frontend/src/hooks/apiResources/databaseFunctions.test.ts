import fetchMock from 'fetch-mock';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  createWrapper,
  defaultStore as store,
} from 'spec/helpers/testing-library';
import { api } from 'src/hooks/apiResources/queryApi';
import { useDatabaseFunctionsQuery } from './databaseFunctions';

const fakeApiResult = {
  function_names: ['abs', 'avg', 'sum'],
};

const expectedResult = fakeApiResult.function_names;
const expectDbId = 'db1';
const dbFunctionNamesApiRoute = `glob:*/api/v1/database/${expectDbId}/function_names/`;

afterEach(() => {
  fetchMock.clearHistory().removeRoutes();
  act(() => {
    store.dispatch(api.util.resetApiState());
  });
});

beforeEach(() => {
  fetchMock.get(dbFunctionNamesApiRoute, fakeApiResult);
});

test('returns api response mapping json result', async () => {
  const { result } = renderHook(
    () =>
      useDatabaseFunctionsQuery({
        dbId: expectDbId,
      }),
    {
      wrapper: createWrapper({
        useRedux: true,
        store,
      }),
    },
  );
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(dbFunctionNamesApiRoute).length).toBe(1),
  );
  expect(result.current.data).toEqual(expectedResult);
  expect(fetchMock.callHistory.calls(dbFunctionNamesApiRoute).length).toBe(1);
  act(() => {
    result.current.refetch();
  });
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(dbFunctionNamesApiRoute).length).toBe(2),
  );
  expect(result.current.data).toEqual(expectedResult);
});

test('returns cached data without api request', async () => {
  const { result, rerender } = renderHook(
    () =>
      useDatabaseFunctionsQuery({
        dbId: expectDbId,
      }),
    {
      wrapper: createWrapper({
        store,
        useRedux: true,
      }),
    },
  );
  await waitFor(() => expect(result.current.data).toEqual(expectedResult));
  expect(fetchMock.callHistory.calls(dbFunctionNamesApiRoute).length).toBe(1);
  rerender();
  await waitFor(() => expect(result.current.data).toEqual(expectedResult));
  expect(fetchMock.callHistory.calls(dbFunctionNamesApiRoute).length).toBe(1);
});

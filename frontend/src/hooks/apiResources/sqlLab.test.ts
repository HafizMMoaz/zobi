import fetchMock from 'fetch-mock';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  createWrapper,
  defaultStore as store,
} from 'spec/helpers/testing-library';
import { api } from 'src/hooks/apiResources/queryApi';
import { DEFAULT_COMMON_BOOTSTRAP_DATA } from 'src/constants';

import { useSqlLabInitialState } from './sqlLab';

const fakeApiResult = {
  result: {
    common: DEFAULT_COMMON_BOOTSTRAP_DATA,
    tab_state_ids: [],
    databases: [],
    queries: {},
    user: {
      userId: 1,
      username: 'some name',
      isActive: true,
      isAnonymous: false,
      firstName: 'first name',
      lastName: 'last name',
      permissions: {},
      roles: {},
    },
  },
};

const expectedResult = fakeApiResult.result;
const sqlLabInitialStateApiRoute = `glob:*/api/v1/sqllab/`;

afterEach(() => {
  fetchMock.clearHistory().removeRoutes();
  act(() => {
    store.dispatch(api.util.resetApiState());
  });
});

beforeEach(() => {
  fetchMock.get(sqlLabInitialStateApiRoute, fakeApiResult);
});

test('returns api response mapping json result', async () => {
  const { result } = renderHook(() => useSqlLabInitialState(), {
    wrapper: createWrapper({
      useRedux: true,
      store,
    }),
  });
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(sqlLabInitialStateApiRoute).length).toBe(
      1,
    ),
  );
  expect(result.current.data).toEqual(expectedResult);
  expect(fetchMock.callHistory.calls(sqlLabInitialStateApiRoute).length).toBe(
    1,
  );
  // clean up cache
  act(() => {
    store.dispatch(api.util.invalidateTags(['SqlLabInitialState']));
  });
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(sqlLabInitialStateApiRoute).length).toBe(
      2,
    ),
  );
  expect(result.current.data).toEqual(expectedResult);
});

test('returns cached data without api request', async () => {
  const { result, rerender } = renderHook(() => useSqlLabInitialState(), {
    wrapper: createWrapper({
      store,
      useRedux: true,
    }),
  });
  await waitFor(() => expect(result.current.data).toEqual(expectedResult));
  expect(fetchMock.callHistory.calls(sqlLabInitialStateApiRoute).length).toBe(
    1,
  );
  rerender();
  await waitFor(() => expect(result.current.data).toEqual(expectedResult));
  expect(fetchMock.callHistory.calls(sqlLabInitialStateApiRoute).length).toBe(
    1,
  );
});

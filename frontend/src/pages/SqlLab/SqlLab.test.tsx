import fetchMock from 'fetch-mock';
import { isValidElement } from 'react';
import { omit } from 'lodash';
import {
  render,
  act,
  waitFor,
  defaultStore as store,
  createStore,
} from 'spec/helpers/testing-library';
import reducers from 'spec/helpers/reducerIndex';
import { api } from 'src/hooks/apiResources/queryApi';
import { DEFAULT_COMMON_BOOTSTRAP_DATA } from 'src/constants';
import getInitialState from 'src/SqlLab/reducers/getInitialState';

import SqlLab from '.';

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
      groups: [],
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

jest.mock('src/SqlLab/components/App', () => () => (
  <div data-test="mock-sqllab-app" />
));

test('is valid', () => {
  expect(isValidElement(<SqlLab />)).toBe(true);
});

test('fetches initial data and renders', async () => {
  expect(fetchMock.callHistory.calls(sqlLabInitialStateApiRoute).length).toBe(
    0,
  );
  const storeWithSqlLab = createStore({}, reducers);
  const { getByTestId } = render(<SqlLab />, {
    useRedux: true,
    useRouter: true,
    store: storeWithSqlLab,
  });

  await waitFor(() =>
    expect(fetchMock.callHistory.calls(sqlLabInitialStateApiRoute).length).toBe(
      1,
    ),
  );

  expect(getByTestId('mock-sqllab-app')).toBeInTheDocument();
  const { sqlLab } = getInitialState(expectedResult);
  expect(storeWithSqlLab.getState()).toEqual(
    expect.objectContaining({
      sqlLab: expect.objectContaining(
        omit(sqlLab, ['queriesLastUpdate', 'editorTabLastUpdatedAt']),
      ),
    }),
  );
});

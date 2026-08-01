import { DatasourceType, getClientErrorObject } from '@zobi-ui/core';
import fetchMock from 'fetch-mock';
import {
  setDatasource,
  changeDatasource,
  saveDataset,
} from 'src/explore/actions/datasourcesActions';
import datasourcesReducer from '../reducers/datasourcesReducer';
import { updateFormDataByDatasource } from './exploreActions';

jest.mock('@zobi-ui/core', () => ({
  ...jest.requireActual('@zobi-ui/core'),
  getClientErrorObject: jest.fn(),
}));

const mockedGetClientErrorObject = getClientErrorObject as jest.Mock;

const CURRENT_DATASOURCE = {
  id: 1,
  uid: '1__table',
  type: DatasourceType.Table,
  columns: [],
  metrics: [],
  column_formats: {},
  verbose_map: {},
  main_dttm_col: '__timestamp',
  // eg. ['["ds", true]', 'ds [asc]']
  datasource_name: 'test datasource',
  description: null,
};

const NEW_DATASOURCE = {
  id: 2,
  type: DatasourceType.Table,
  columns: [],
  metrics: [],
  column_formats: {},
  verbose_map: {},
  main_dttm_col: '__timestamp',
  // eg. ['["ds", true]', 'ds [asc]']
  datasource_name: 'test datasource',
  description: null,
};

const SAVE_DATASET_POST_ARGS = {
  schema: 'foo',
  sql: 'select * from bar',
  database: { id: 1 },
  templateParams: undefined,
  datasourceName: 'new dataset',
  columns: [],
};

const defaultDatasourcesReducerState = {
  [CURRENT_DATASOURCE.uid]: CURRENT_DATASOURCE,
};

const saveDatasetEndpoint = `glob:*/api/v1/dataset/`;

test('sets new datasource', () => {
  const newState = datasourcesReducer(
    defaultDatasourcesReducerState,
    setDatasource(NEW_DATASOURCE),
  );
  expect(newState).toEqual({
    ...defaultDatasourcesReducerState,
    '2__table': NEW_DATASOURCE,
  });
});

test('change datasource action', () => {
  const dispatch = jest.fn();
  const getState = jest.fn(() => ({
    explore: {
      datasource: CURRENT_DATASOURCE,
    },
  }));
  // ignore getState type check - we dont need explore.datasource field for this test
  // @ts-expect-error
  changeDatasource(NEW_DATASOURCE)(dispatch, getState);
  expect(dispatch).toHaveBeenCalledTimes(2);
  expect(dispatch).toHaveBeenNthCalledWith(1, setDatasource(NEW_DATASOURCE));
  expect(dispatch).toHaveBeenNthCalledWith(
    2,
    updateFormDataByDatasource(CURRENT_DATASOURCE, NEW_DATASOURCE),
  );
});

test('saveDataset handles success', async () => {
  const datasource = { id: 1 };
  const saveDatasetResponse = {
    data: datasource,
  };
  fetchMock.clearHistory().removeRoutes();
  fetchMock.post(saveDatasetEndpoint, saveDatasetResponse);
  const dispatch = jest.fn();
  const getState = jest.fn(() => ({ explore: { datasource } }));
  const dataset = await saveDataset(SAVE_DATASET_POST_ARGS)(dispatch);

  expect(fetchMock.callHistory.calls(saveDatasetEndpoint)).toHaveLength(1);
  expect(dispatch.mock.calls.length).toBe(1);
  const thunk = dispatch.mock.calls[0][0];
  thunk(dispatch, getState);
  expect(dispatch.mock.calls[1][0].type).toEqual('SET_DATASOURCE');

  expect(dataset).toEqual(datasource);
});

test('updateSlice with add to existing dashboard handles failure', async () => {
  fetchMock.clearHistory().removeRoutes();
  const sampleError = new Error('sampleError');
  mockedGetClientErrorObject.mockImplementation(() =>
    Promise.resolve(sampleError),
  );
  fetchMock.post(saveDatasetEndpoint, { throws: sampleError });
  const dispatch = jest.fn();

  let caughtError;
  try {
    await saveDataset(SAVE_DATASET_POST_ARGS)(dispatch);
  } catch (error) {
    caughtError = error;
  }

  expect(caughtError).toEqual(sampleError);
  expect(fetchMock.callHistory.calls(saveDatasetEndpoint)).toHaveLength(4);
  expect(mockedGetClientErrorObject).toHaveBeenCalledWith(sampleError);
});

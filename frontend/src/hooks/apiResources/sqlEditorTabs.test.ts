import fetchMock from 'fetch-mock';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  createWrapper,
  defaultStore as store,
} from 'spec/helpers/testing-library';
import { api } from 'src/hooks/apiResources/queryApi';
import { LatestQueryEditorVersion } from 'src/SqlLab/types';
import {
  useDeleteSqlEditorTabMutation,
  useUpdateCurrentSqlEditorTabMutation,
  useUpdateSqlEditorTabMutation,
} from './sqlEditorTabs';

const expectedQueryEditor = {
  version: LatestQueryEditorVersion,
  id: '123',
  immutableId: 'immutable-id',
  dbId: 456,
  name: 'tab 1',
  sql: 'SELECT * from example_table',
  schema: 'my_schema',
  templateParams: '{"a": 1, "v": "str"}',
  queryLimit: 1000,
  remoteId: null,
  autorun: false,
  hideLeftBar: false,
  updatedAt: Date.now(),
};

afterEach(() => {
  fetchMock.clearHistory().removeRoutes();
  act(() => {
    store.dispatch(api.util.resetApiState());
  });
});

test('puts api request with formData', async () => {
  const tabStateMutationApiRoute = `glob:*/tabstateview/${expectedQueryEditor.id}`;
  fetchMock.put(tabStateMutationApiRoute, 200);
  const { result } = renderHook(() => useUpdateSqlEditorTabMutation(), {
    wrapper: createWrapper({
      useRedux: true,
      store,
    }),
  });
  act(() => {
    result.current[0]({
      queryEditor: expectedQueryEditor,
    });
  });
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(tabStateMutationApiRoute).length).toBe(
      1,
    ),
  );
  const formData = fetchMock.callHistory.calls(tabStateMutationApiRoute)[0]
    .options?.body as FormData;
  expect(formData.get('database_id')).toBe(`${expectedQueryEditor.dbId}`);
  expect(formData.get('schema')).toBe(
    JSON.stringify(`${expectedQueryEditor.schema}`),
  );
  expect(formData.get('sql')).toBe(
    JSON.stringify(`${expectedQueryEditor.sql}`),
  );
  expect(formData.get('label')).toBe(
    JSON.stringify(`${expectedQueryEditor.name}`),
  );
  expect(formData.get('query_limit')).toBe(`${expectedQueryEditor.queryLimit}`);
  expect(formData.has('latest_query_id')).toBe(false);
  expect(formData.get('template_params')).toBe(
    JSON.stringify(`${expectedQueryEditor.templateParams}`),
  );
  expect(formData.get('hide_left_bar')).toBe(
    `${expectedQueryEditor.hideLeftBar}`,
  );
  expect(formData.get('extra_json')).toBe(
    JSON.stringify(
      JSON.stringify({
        updatedAt: expectedQueryEditor.updatedAt,
        version: LatestQueryEditorVersion,
      }),
    ),
  );
});

test('posts activate request with queryEditorId', async () => {
  const tabStateMutationApiRoute = `glob:*/tabstateview/${expectedQueryEditor.id}/activate`;
  fetchMock.post(tabStateMutationApiRoute, 200);
  const { result } = renderHook(() => useUpdateCurrentSqlEditorTabMutation(), {
    wrapper: createWrapper({
      useRedux: true,
      store,
    }),
  });
  act(() => {
    result.current[0](expectedQueryEditor.id);
  });
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(tabStateMutationApiRoute).length).toBe(
      1,
    ),
  );
});

test('deletes destoryed query editors', async () => {
  const tabStateMutationApiRoute = `glob:*/tabstateview/${expectedQueryEditor.id}`;
  fetchMock.delete(tabStateMutationApiRoute, 200);
  const { result } = renderHook(() => useDeleteSqlEditorTabMutation(), {
    wrapper: createWrapper({
      useRedux: true,
      store,
    }),
  });
  act(() => {
    result.current[0](expectedQueryEditor.id);
  });
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(tabStateMutationApiRoute).length).toBe(
      1,
    ),
  );
});

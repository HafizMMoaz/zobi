import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { initialState, defaultQueryEditor } from 'src/SqlLab/fixtures';
import { renderHook } from '@testing-library/react';
import { createWrapper } from 'spec/helpers/testing-library';

import useQueryEditor from '.';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

test('returns selected queryEditor values', () => {
  const { result } = renderHook(
    () =>
      useQueryEditor(defaultQueryEditor.id, ['id', 'name', 'dbId', 'schema']),
    {
      wrapper: createWrapper({
        useRedux: true,
        store: mockStore(initialState),
      }),
    },
  );
  expect(result.current).toEqual({
    id: defaultQueryEditor.id,
    name: defaultQueryEditor.name,
    dbId: defaultQueryEditor.dbId,
    schema: defaultQueryEditor.schema,
  });
});

test('includes id implicitly', () => {
  const { result } = renderHook(
    () => useQueryEditor(defaultQueryEditor.id, ['name']),
    {
      wrapper: createWrapper({
        useRedux: true,
        store: mockStore(initialState),
      }),
    },
  );
  expect(result.current).toEqual({
    id: defaultQueryEditor.id,
    name: defaultQueryEditor.name,
  });
});

test('returns updated values from unsaved change', () => {
  const expectedSql = 'SELECT updated_column\nFROM updated_table\nWHERE';
  const { result } = renderHook(
    () => useQueryEditor(defaultQueryEditor.id, ['id', 'sql']),
    {
      wrapper: createWrapper({
        useRedux: true,
        store: mockStore({
          ...initialState,
          sqlLab: {
            ...initialState.sqlLab,
            unsavedQueryEditor: {
              id: defaultQueryEditor.id,
              sql: expectedSql,
            },
          },
        }),
      }),
    },
  );
  expect(result.current.id).toEqual(defaultQueryEditor.id);
  expect(result.current.sql).toEqual(expectedSql);
});

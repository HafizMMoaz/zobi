import type {
  InnerQueryResults,
  Query,
  QueryResponse,
  QueryResults,
} from '@zobi-ui/core';
import type {
  CursorPosition,
  QueryEditor,
  SqlLabRootState,
  Table,
} from 'src/SqlLab/types';
import type { ThunkDispatch } from 'redux-thunk';
import { pick } from 'lodash';
import { tableApiUtil } from 'src/hooks/apiResources/tables';
import {
  BYTES_PER_CHAR,
  KB_STORAGE,
  LOCALSTORAGE_MAX_QUERY_AGE_MS,
  LOCALSTORAGE_MAX_QUERY_RESULTS_KB,
} from '../constants';

const PERSISTENT_QUERY_EDITOR_KEYS = new Set([
  'version',
  'remoteId',
  'autorun',
  'dbId',
  'height',
  'id',
  'immutableId',
  'latestQueryId',
  'northPercent',
  'queryLimit',
  'schema',
  'selectedText',
  'southPercent',
  'sql',
  'templateParams',
  'name',
  'hideLeftBar',
]);

function shouldEmptyQueryResults(query: QueryResponse) {
  const { startDttm, results } = query;
  return (
    Date.now() - startDttm > LOCALSTORAGE_MAX_QUERY_AGE_MS ||
    ((JSON.stringify(results)?.length || 0) * BYTES_PER_CHAR) / KB_STORAGE >
      LOCALSTORAGE_MAX_QUERY_RESULTS_KB
  );
}

export function emptyTablePersistData(tables: Table[]) {
  return tables
    .map(table =>
      pick(table, [
        'id',
        'name',
        'dbId',
        'schema',
        'dataPreviewQueryId',
        'queryEditorId',
      ]),
    )
    .filter(({ queryEditorId }) => Boolean(queryEditorId));
}

type InnerEmptyQueryResults = {
  [key in string]: Query &
    QueryResults & {
      inLocalStorage?: boolean;
    };
};

type EmptyQueryResults = Record<
  string,
  InnerEmptyQueryResults & {
    results: InnerQueryResults | {};
  }
>;

export function emptyQueryResults(
  queries: SqlLabRootState['sqlLab']['queries'],
) {
  return Object.keys(queries).reduce((accu, key) => {
    const { results } = queries[key];
    const query = {
      ...queries[key],
      results: shouldEmptyQueryResults(queries[key]) ? {} : results,
    };

    const updatedQueries = {
      ...accu,
      [key]: query,
    };
    return updatedQueries;
  }, {} as EmptyQueryResults);
}

export function clearQueryEditors(queryEditors: QueryEditor[]) {
  return queryEditors.map(editor =>
    // only return selected keys
    Object.keys(editor)
      .filter(key => PERSISTENT_QUERY_EDITOR_KEYS.has(key))
      .reduce<
        Record<
          string,
          string | number | boolean | CursorPosition | null | undefined
        >
      >(
        (accumulator, key) => ({
          ...accumulator,
          [key]: editor[key as keyof QueryEditor],
        }),
        {},
      ),
  );
}

export function rehydratePersistedState(
  dispatch: ThunkDispatch<SqlLabRootState, unknown, any>,
  state: SqlLabRootState,
) {
  // Rehydrate server side persisted table metadata
  state.sqlLab.tables.forEach(
    ({ name: table, catalog, schema, dbId, persistData }) => {
      if (dbId && schema && table && persistData?.columns) {
        dispatch(
          tableApiUtil.upsertQueryData(
            'tableMetadata',
            { dbId, catalog, schema, table },
            persistData,
          ),
        );
        dispatch(
          tableApiUtil.upsertQueryData(
            'tableExtendedMetadata',
            { dbId, catalog, schema, table },
            {},
          ),
        );
      }
    },
  );
}

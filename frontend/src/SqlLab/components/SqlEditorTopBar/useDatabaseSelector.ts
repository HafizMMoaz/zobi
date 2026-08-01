import { useEffect, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'src/views/store';

import { SqlLabRootState } from 'src/SqlLab/types';
import {
  queryEditorSetDb,
  queryEditorSetCatalog,
  queryEditorSetSchema,
  setDatabases,
  addDangerToast,
  type Database,
} from 'src/SqlLab/actions/sqlLab';
import { type DatabaseObject } from 'src/components';
import useQueryEditor from 'src/SqlLab/hooks/useQueryEditor';
import {
  getItem,
  LocalStorageKeys,
  setItem,
} from 'src/utils/localStorageHelpers';

export default function useDatabaseSelector(queryEditorId: string) {
  const databases = useSelector<
    SqlLabRootState,
    SqlLabRootState['sqlLab']['databases']
  >(({ sqlLab }) => sqlLab.databases);
  const dispatch = useAppDispatch();
  const queryEditor = useQueryEditor(queryEditorId, [
    'dbId',
    'catalog',
    'schema',
    'tabViewId',
  ]);
  const database = useMemo(
    () => (queryEditor.dbId ? databases[queryEditor.dbId] : undefined),
    [databases, queryEditor.dbId],
  );
  const [userSelectedDb, setUserSelected] = useState<DatabaseObject | null>(
    null,
  );
  const { catalog, schema } = queryEditor;

  const onDbChange = useCallback(
    ({ id: dbId }: { id: number }) => {
      if (queryEditor) {
        dispatch(queryEditorSetDb(queryEditor, dbId));
      }
    },
    [dispatch, queryEditor],
  );

  const handleCatalogChange = useCallback(
    (catalog?: string | null) => {
      if (queryEditor) {
        dispatch(queryEditorSetCatalog(queryEditor, catalog ?? null));
      }
    },
    [dispatch, queryEditor],
  );

  const handleSchemaChange = useCallback(
    (schema: string) => {
      if (queryEditor) {
        dispatch(queryEditorSetSchema(queryEditor, schema));
      }
    },
    [dispatch, queryEditor],
  );

  const handleDbList = useCallback(
    (result: DatabaseObject[]) => {
      dispatch(setDatabases(result as unknown as Database[]));
    },
    [dispatch],
  );

  const handleError = useCallback(
    (message: string) => {
      dispatch(addDangerToast(message));
    },
    [dispatch],
  );

  useEffect(() => {
    const bool = new URLSearchParams(window.location.search).get('db');
    const userSelected = getItem(
      LocalStorageKeys.Database,
      null,
    ) as DatabaseObject | null;

    if (bool && userSelected) {
      setUserSelected(userSelected);
      setItem(LocalStorageKeys.Database, null);
    } else if (database) {
      setUserSelected(database);
    }
  }, [database]);

  return {
    db: userSelectedDb,
    catalog,
    schema,
    getDbList: handleDbList,
    handleError,
    onDbChange,
    onCatalogChange: handleCatalogChange,
    onSchemaChange: handleSchemaChange,
  };
}

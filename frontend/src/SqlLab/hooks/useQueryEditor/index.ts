import { pick } from 'lodash';
import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { SqlLabRootState, QueryEditor } from 'src/SqlLab/types';

export const EMPTY_STATE_QE_ID = 'tmp_qe_id';

export default function useQueryEditor<T extends keyof QueryEditor>(
  sqlEditorId: string,
  attributes: ReadonlyArray<T>,
) {
  const queryEditors = useSelector<SqlLabRootState, QueryEditor[]>(
    ({ sqlLab: { queryEditors } }) => queryEditors,
    shallowEqual,
  );
  const queryEditorsById = useMemo(
    () =>
      Object.fromEntries(
        queryEditors.map((editor, index) => [editor.id, index]),
      ),
    [queryEditors.map(({ id }) => id).join(',')],
  );

  return useSelector<SqlLabRootState, Pick<QueryEditor, T | 'id'>>(
    ({ sqlLab: { unsavedQueryEditor } }) =>
      pick(
        {
          ...queryEditors[queryEditorsById[sqlEditorId]],
          ...(sqlEditorId === unsavedQueryEditor?.id && unsavedQueryEditor),
          ...(sqlEditorId === EMPTY_STATE_QE_ID && { id: sqlEditorId }),
        },
        ['id'].concat(attributes),
      ) as Pick<QueryEditor, T | 'id'>,
    shallowEqual,
  );
}

import { pickBy } from 'lodash';
import { QueryEditor, LatestQueryEditorVersion } from 'src/SqlLab/types';
import { api, JsonResponse } from './queryApi';

export type EditorMutationParams = {
  queryEditor: QueryEditor;
  extra?: Record<string, any>;
};

const sqlEditorApi = api.injectEndpoints({
  endpoints: builder => ({
    updateSqlEditorTab: builder.mutation<JsonResponse, EditorMutationParams>({
      query: ({
        queryEditor: {
          version = LatestQueryEditorVersion,
          id,
          dbId,
          catalog,
          schema,
          queryLimit,
          sql,
          name,
          latestQueryId,
          hideLeftBar,
          templateParams,
          autorun,
          updatedAt,
          tabViewId,
        },
        extra,
      }) => ({
        method: 'PUT',
        endpoint: encodeURI(`/tabstateview/${tabViewId ?? id}`),
        postPayload: pickBy(
          {
            database_id: dbId,
            catalog,
            schema,
            sql,
            label: name,
            query_limit: queryLimit,
            latest_query_id: latestQueryId,
            template_params: templateParams,
            hide_left_bar: hideLeftBar,
            autorun,
            extra_json: JSON.stringify({ updatedAt, version, ...extra }),
          },
          value => value !== undefined,
        ),
      }),
    }),
    updateCurrentSqlEditorTab: builder.mutation<string, string | number>({
      query: queryEditorId => ({
        method: 'POST',
        endpoint: encodeURI(`/tabstateview/${queryEditorId}/activate`),
        transformResponse: () => queryEditorId,
      }),
    }),
    deleteSqlEditorTab: builder.mutation<void, string | number>({
      query: queryEditorId => ({
        method: 'DELETE',
        endpoint: encodeURI(`/tabstateview/${queryEditorId}`),
        transformResponse: () => queryEditorId,
      }),
    }),
  }),
});

export const {
  useUpdateSqlEditorTabMutation,
  useUpdateCurrentSqlEditorTabMutation,
  useDeleteSqlEditorTabMutation,
} = sqlEditorApi;

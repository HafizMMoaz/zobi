import type { QueryResponse } from '@zobi-ui/core';
import type { JsonResponse } from './queryApi';
import { api } from './queryApi';

export type InitialState = {
  active_tab: {
    id: number;
    user_id: number;
    label: string;
    active: boolean;
    database_id: number;
    catalog?: string | null;
    schema?: string;
    table_schemas: {
      id: number;
      table: string;
      description: {
        name: string;
        columns: {
          name: string;
          type: string;
          longType: string;
        }[];
        dataPreviewQueryId?: string;
      } & Record<string, any>;
      catalog?: string | null;
      schema?: string;
      tab_state_id: number;
      database_id?: number;
      expanded?: boolean;
    }[];
    sql: string;
    query_limit?: number;
    latest_query: QueryResponse | null;
    autorun?: boolean;
    template_params: string | null;
    hide_left_bar?: boolean;
    saved_query: { id: number } | null;
    extra_json?: Record<string, any>;
  };
  databases: object[];
  queries: Record<
    string,
    Omit<QueryResponse, 'startDttm' | 'endDttm'> & {
      startDttm: number | string;
      endDttm: number | string;
      inLocalStorage?: boolean;
    }
  >;
  tab_state_ids: {
    id: number;
    label: string;
  }[];
};

const initialStateApi = api.injectEndpoints({
  endpoints: builder => ({
    sqlLabInitialState: builder.query<InitialState, void>({
      providesTags: ['SqlLabInitialState'],
      query: () => ({
        endpoint: `/api/v1/sqllab/`,
        headers: { 'Content-Type': 'application/json' },
        transformResponse: ({ json }: JsonResponse) => json.result,
      }),
    }),
  }),
});

export const { useSqlLabInitialStateQuery: useSqlLabInitialState } =
  initialStateApi;

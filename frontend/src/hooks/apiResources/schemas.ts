import { useCallback, useEffect } from 'react';
import { ClientErrorObject } from '@zobi.dev/core';
import useEffectEvent from 'src/hooks/useEffectEvent';
import { api, JsonResponse } from './queryApi';

export type SchemaOption = {
  value: string;
  label: string;
  title: string;
};

export type FetchSchemasQueryParams = {
  dbId?: string | number;
  catalog?: string;
  forceRefresh: boolean;
  onSuccess?: (data: SchemaOption[], isRefetched: boolean) => void;
  onError?: (error: ClientErrorObject) => void;
};

type Params = Omit<FetchSchemasQueryParams, 'forceRefresh'>;

const schemaApi = api.injectEndpoints({
  endpoints: builder => ({
    schemas: builder.query<SchemaOption[], FetchSchemasQueryParams>({
      providesTags: [{ type: 'Schemas', id: 'LIST' }],
      query: ({ dbId, catalog, forceRefresh }) => ({
        endpoint: `/api/v1/database/${dbId}/schemas/`,
        // TODO: Would be nice to add pagination in a follow-up. Needs endpoint changes.
        urlParams: {
          force: forceRefresh,
          ...(catalog !== undefined && { catalog }),
        },
        transformResponse: ({ json }: JsonResponse) =>
          json.result.sort().map((value: string) => ({
            value,
            label: value,
            title: value,
          })),
      }),
      serializeQueryArgs: ({ queryArgs: { dbId, catalog } }) => ({
        dbId,
        catalog,
      }),
    }),
  }),
});

export const {
  useLazySchemasQuery,
  useSchemasQuery,
  endpoints: schemaEndpoints,
  util: schemaApiUtil,
} = schemaApi;

export const EMPTY_SCHEMAS = [] as SchemaOption[];

export function useSchemas(options: Params) {
  const { dbId, catalog, onSuccess, onError } = options || {};
  const [trigger] = useLazySchemasQuery();
  const result = useSchemasQuery(
    { dbId, catalog: catalog || undefined, forceRefresh: false },
    {
      skip: !dbId,
    },
  );

  useEffect(() => {
    if (result.isError) {
      onError?.(result.error as ClientErrorObject);
    }
  }, [result.isError, result.error, onError]);

  const fetchData = useEffectEvent(
    (
      dbId: FetchSchemasQueryParams['dbId'],
      catalog: FetchSchemasQueryParams['catalog'],
      forceRefresh = false,
    ) => {
      if (dbId && (!result.currentData || forceRefresh)) {
        trigger({ dbId, catalog, forceRefresh }).then(
          ({ isSuccess, isError, data }) => {
            if (isSuccess) {
              onSuccess?.(data || EMPTY_SCHEMAS, forceRefresh);
            }
            if (isError) {
              onError?.(result.error as ClientErrorObject);
            }
          },
        );
      }
    },
  );

  useEffect(() => {
    fetchData(dbId, catalog, false);
  }, [dbId, catalog, fetchData]);

  const refetch = useCallback(() => {
    fetchData(dbId, catalog, true);
  }, [dbId, catalog, fetchData]);

  return {
    ...result,
    refetch,
  };
}

import { useCallback, useEffect } from 'react';
import { ClientErrorObject } from '@zobi-ui/core';
import useEffectEvent from 'src/hooks/useEffectEvent';
import { api, JsonResponse } from './queryApi';

export type CatalogOption = {
  value: string;
  label: string;
  title: string;
};

export type FetchCatalogsQueryParams = {
  dbId?: string | number;
  forceRefresh: boolean;
  onSuccess?: (data: CatalogOption[], isRefetched: boolean) => void;
  onError?: (error: ClientErrorObject) => void;
};

type Params = Omit<FetchCatalogsQueryParams, 'forceRefresh'>;

const catalogApi = api.injectEndpoints({
  endpoints: builder => ({
    catalogs: builder.query<CatalogOption[], FetchCatalogsQueryParams>({
      providesTags: [{ type: 'Catalogs', id: 'LIST' }],
      query: ({ dbId, forceRefresh }) => ({
        endpoint: `/api/v1/database/${dbId}/catalogs/`,
        urlParams: {
          force: forceRefresh,
        },
        transformResponse: ({ json }: JsonResponse) =>
          json.result.sort().map((value: string) => ({
            value,
            label: value,
            title: value,
          })),
      }),
      serializeQueryArgs: ({ queryArgs: { dbId } }) => ({
        dbId,
      }),
    }),
  }),
});

export const {
  useLazyCatalogsQuery,
  useCatalogsQuery,
  endpoints: catalogEndpoints,
  util: catalogApiUtil,
} = catalogApi;

export const EMPTY_CATALOGS = [] as CatalogOption[];

export function useCatalogs(options: Params) {
  const { dbId, onSuccess, onError } = options || {};
  const [trigger] = useLazyCatalogsQuery();
  const result = useCatalogsQuery(
    { dbId, forceRefresh: false },
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
    (dbId: FetchCatalogsQueryParams['dbId'], forceRefresh = false) => {
      if (dbId && (!result.currentData || forceRefresh)) {
        trigger({ dbId, forceRefresh }).then(({ isSuccess, isError, data }) => {
          if (isSuccess) {
            onSuccess?.(data || EMPTY_CATALOGS, forceRefresh);
          }
          if (isError) {
            onError?.(result.error as ClientErrorObject);
          }
        });
      }
    },
  );

  const refetch = useCallback(() => {
    fetchData(dbId, true);
  }, [dbId, fetchData]);

  useEffect(() => {
    fetchData(dbId, false);
  }, [dbId, fetchData]);

  return {
    ...result,
    refetch,
  };
}

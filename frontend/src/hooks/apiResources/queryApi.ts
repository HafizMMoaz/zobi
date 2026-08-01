import rison from 'rison';
import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import {
  ClientErrorObject,
  getClientErrorObject,
  ZobiClient,
  ParseMethod,
  ZobiClientResponse,
  JsonValue,
  RequestBase,
} from '@zobi-ui/core';

export type { JsonResponse, TextResponse } from '@zobi-ui/core';

export const zobiClientQuery: BaseQueryFn<
  Pick<RequestBase, 'method' | 'body' | 'jsonPayload' | 'postPayload'> & {
    endpoint: string;
    parseMethod?: ParseMethod;
    transformResponse?: (response: ZobiClientResponse) => JsonValue;
    urlParams?: Record<string, number | string | undefined | boolean | object>;
  },
  JsonValue,
  ClientErrorObject
> = (
  {
    endpoint,
    urlParams,
    transformResponse,
    method = 'GET',
    parseMethod = 'json',
    ...rest
  },
  api,
) =>
  ZobiClient.request({
    ...rest,
    endpoint: `${endpoint}${urlParams ? `?q=${rison.encode(urlParams)}` : ''}`,
    method,
    parseMethod,
    signal: api.signal,
  })
    .then(data => ({
      data: transformResponse?.(data) ?? data,
    }))
    .catch(response =>
      getClientErrorObject(response).then(errorObj => ({
        error: {
          error: errorObj?.message || errorObj?.error || response.statusText,
          errors: errorObj?.errors || [], // used by <ErrorMessageWithStackTrace />
          status: response.status,
        },
      })),
    );

export const api = createApi({
  reducerPath: 'queryApi',
  tagTypes: [
    'Catalogs',
    'Schemas',
    'Tables',
    'DatabaseFunctions',
    'QueryValidations',
    'TableMetadatas',
    'SqlLabInitialState',
    'EditorQueries',
  ],
  endpoints: () => ({}),
  baseQuery: zobiClientQuery,
});

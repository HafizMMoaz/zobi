import { api } from './queryApi';

export type FetchDataFunctionsQueryParams = {
  dbId?: string | number;
};

type FunctionNamesResponse = {
  json: {
    function_names: string[];
  };
  response: Response;
};

const databaseFunctionApi = api.injectEndpoints({
  endpoints: builder => ({
    databaseFunctions: builder.query<string[], FetchDataFunctionsQueryParams>({
      providesTags: ['DatabaseFunctions'],
      query: ({ dbId }) => ({
        endpoint: `/api/v1/database/${dbId}/function_names/`,
        transformResponse: ({ json }: FunctionNamesResponse) =>
          json.function_names,
      }),
    }),
  }),
});

export const { useDatabaseFunctionsQuery } = databaseFunctionApi;

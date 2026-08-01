import { api, JsonResponse } from './queryApi';

export type FetchValidationQueryParams = {
  dbId?: string | number;
  catalog?: string | null;
  schema?: string;
  sql: string;
  templateParams?: string;
};

export type ValidationResult = {
  end_column: number | null;
  line_number: number | null;
  message: string | null;
  start_column: number | null;
};

const queryValidationApi = api.injectEndpoints({
  endpoints: builder => ({
    queryValidations: builder.query<
      ValidationResult[],
      FetchValidationQueryParams
    >({
      providesTags: ['QueryValidations'],
      query: ({ dbId, catalog, schema, sql, templateParams }) => {
        let template_params = templateParams;
        try {
          template_params = JSON.parse(templateParams || '');
        } catch (e) {
          template_params = undefined;
        }
        const postPayload = {
          catalog,
          schema,
          sql,
          ...(template_params && { template_params }),
        };
        return {
          method: 'post',
          endpoint: `/api/v1/database/${dbId}/validate_sql/`,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postPayload),
          transformResponse: ({ json }: JsonResponse) => json.result,
        };
      },
    }),
  }),
});

export const { useQueryValidationsQuery } = queryValidationApi;

import fetchMock from 'fetch-mock';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  createWrapper,
  defaultStore as store,
} from 'spec/helpers/testing-library';
import { api } from 'src/hooks/apiResources/queryApi';
import { useQueryValidationsQuery } from './queryValidations';

const fakeApiResult = {
  result: [
    {
      end_column: null,
      line_number: 3,
      message: 'ERROR: syntax error at or near ";"',
      start_column: null,
    },
  ],
};

const expectedResult = fakeApiResult.result;

const expectDbId = 'db1';
const expectSchema = 'my_schema';
const expectSql = 'SELECT * from example_table';
const expectTemplateParams = '{"a": 1, "v": "str"}';

afterEach(() => {
  fetchMock.clearHistory().removeRoutes();
  act(() => {
    store.dispatch(api.util.resetApiState());
  });
});

test('returns api response mapping json result', async () => {
  const queryValidationApiRoute = `glob:*/api/v1/database/${expectDbId}/validate_sql/`;
  fetchMock.post(queryValidationApiRoute, fakeApiResult);
  const { result } = renderHook(
    () =>
      useQueryValidationsQuery({
        dbId: expectDbId,
        sql: expectSql,
        schema: expectSchema,
        templateParams: expectTemplateParams,
      }),
    {
      wrapper: createWrapper({
        useRedux: true,
        store,
      }),
    },
  );
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(queryValidationApiRoute).length).toBe(1),
  );
  expect(result.current.data).toEqual(expectedResult);
  expect(fetchMock.callHistory.calls(queryValidationApiRoute).length).toBe(1);
  expect(
    JSON.parse(
      `${fetchMock.callHistory.calls(queryValidationApiRoute)[0].options?.body}`,
    ),
  ).toEqual({
    schema: expectSchema,
    sql: expectSql,
    template_params: JSON.parse(expectTemplateParams),
  });
  act(() => {
    result.current.refetch();
  });
  await waitFor(() =>
    expect(fetchMock.callHistory.calls(queryValidationApiRoute).length).toBe(2),
  );
  expect(result.current.data).toEqual(expectedResult);
});

test('returns cached data without api request', async () => {
  const queryValidationApiRoute = `glob:*/api/v1/database/${expectDbId}/validate_sql/`;
  fetchMock.post(queryValidationApiRoute, fakeApiResult);
  const { result, rerender } = renderHook(
    () =>
      useQueryValidationsQuery({
        dbId: expectDbId,
        sql: expectSql,
        schema: expectSchema,
        templateParams: expectTemplateParams,
      }),
    {
      wrapper: createWrapper({
        useRedux: true,
        store,
      }),
    },
  );
  await waitFor(() => expect(result.current.data).toEqual(expectedResult));
  expect(fetchMock.callHistory.calls(queryValidationApiRoute).length).toBe(1);
  rerender();
  await waitFor(() => expect(result.current.data).toEqual(expectedResult));
  expect(fetchMock.callHistory.calls(queryValidationApiRoute).length).toBe(1);
});

import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import thunk from 'redux-thunk';
import { fireEvent, render, waitFor } from 'spec/helpers/testing-library';
import { Store } from 'redux';
import { ZobiClientClass } from '@zobi-ui/core';
import { initialState } from 'src/SqlLab/fixtures';

import ExploreCtasResultsButton, {
  ExploreCtasResultsButtonProps,
} from 'src/SqlLab/components/ExploreCtasResultsButton';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const getOrCreateTableEndpoint = `glob:*/api/v1/dataset/get_or_create/`;

const setup = (props: Partial<ExploreCtasResultsButtonProps>, store?: Store) =>
  render(
    <ExploreCtasResultsButton
      table="test"
      schema="test_schema"
      dbId={12346}
      {...props}
    />,
    {
      useRedux: true,
      ...(store && { store }),
    },
  );

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ExploreCtasResultsButton', () => {
  const postFormSpy = jest.spyOn(ZobiClientClass.prototype, 'postForm');
  postFormSpy.mockImplementation(jest.fn());

  test('renders', async () => {
    const { queryByText } = setup({}, mockStore(initialState));

    expect(queryByText('Explore')).toBeInTheDocument();
  });

  test('visualize results', async () => {
    const { getByText } = setup({}, mockStore(initialState));

    postFormSpy.mockClear();
    fetchMock.clearHistory().removeRoutes();
    fetchMock.post(getOrCreateTableEndpoint, { result: { table_id: 1234 } });

    fireEvent.click(getByText('Explore'));

    await waitFor(() => {
      expect(postFormSpy).toHaveBeenCalledTimes(1);
      expect(postFormSpy).toHaveBeenCalledWith('http://localhost/explore/', {
        form_data:
          '{"datasource":"1234__table","metrics":["count"],"groupby":[],"viz_type":"table","since":"100 years ago","all_columns":[],"row_limit":1000}',
      });
    });
  });

  test('visualize results fails', async () => {
    const { getByText } = setup({}, mockStore(initialState));

    postFormSpy.mockClear();
    fetchMock.clearHistory().removeRoutes();
    fetchMock.post(getOrCreateTableEndpoint, {
      throws: new Error('Unexpected all to v1 API'),
    });

    fireEvent.click(getByText('Explore'));

    await waitFor(() => {
      expect(postFormSpy).toHaveBeenCalledTimes(0);
    });
  });
});

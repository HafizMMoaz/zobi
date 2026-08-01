import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';

import { fireEvent, render, waitFor } from 'spec/helpers/testing-library';
import { overwriteConfirmMetadata } from 'spec/fixtures/mockDashboardState';
import OverwriteConfirmModal from './OverwriteConfirmModal';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('react-diff-viewer-continued', () => () => (
  <div data-test="mock-diff-viewer" />
));

test('renders diff viewer when it contains overwriteConfirmMetadata', async () => {
  const { queryByText, findAllByTestId } = render(
    <OverwriteConfirmModal
      overwriteConfirmMetadata={overwriteConfirmMetadata}
    />,
    {
      useRedux: true,
      store: mockStore(),
    },
  );
  expect(queryByText('Confirm overwrite')).toBeInTheDocument();
  const diffViewers = await findAllByTestId('mock-diff-viewer');
  expect(diffViewers).toHaveLength(
    overwriteConfirmMetadata.overwriteConfirmItems.length,
  );
});

test('requests update dashboard api when save button is clicked', async () => {
  const updateDashboardEndpoint = `glob:*/api/v1/dashboard/${overwriteConfirmMetadata.dashboardId}`;
  const fetchDatasetsEndpoint = `glob:*/api/v1/dashboard/${overwriteConfirmMetadata.dashboardId}/datasets`;

  // mock fetch datasets
  fetchMock.get(fetchDatasetsEndpoint, []);

  fetchMock.put(
    updateDashboardEndpoint,
    {
      id: overwriteConfirmMetadata.dashboardId,
      last_modified_time: +new Date(),
      result: overwriteConfirmMetadata.data,
    },
    { name: updateDashboardEndpoint },
  );
  const store = mockStore({
    dashboardLayout: { present: {} },
    dashboardFilters: {},
    dashboardInfo: { metadata: {} },
    charts: {},
  });
  const { findByTestId } = render(
    <OverwriteConfirmModal
      overwriteConfirmMetadata={overwriteConfirmMetadata}
    />,
    {
      useRedux: true,
      store,
    },
  );
  const saveButton = await findByTestId('overwrite-confirm-save-button');
  expect(fetchMock.callHistory.calls(updateDashboardEndpoint)).toHaveLength(0);
  fireEvent.click(saveButton);
  expect(fetchMock.callHistory.calls(updateDashboardEndpoint)).toHaveLength(0);
  mockAllIsIntersecting(true);
  fireEvent.click(saveButton);
  await waitFor(() =>
    expect(
      fetchMock.callHistory.calls(updateDashboardEndpoint)?.[0]?.options?.body,
    ).toEqual(JSON.stringify(overwriteConfirmMetadata.data)),
  );
  await waitFor(() =>
    expect(store.getActions()).toContainEqual({
      type: 'SET_OVERRIDE_CONFIRM',
      overwriteConfirmMetadata: undefined,
    }),
  );
});

import configureStore from 'redux-mock-store';
import { render, waitFor } from 'spec/helpers/testing-library';
import { overwriteConfirmMetadata } from 'spec/fixtures/mockDashboardState';

import OverwriteConfirm from '.';

import './OverwriteConfirmModal';

const mockStore = configureStore();

test('renders nothing without overwriteConfirmMetadata', () => {
  const { queryByText } = render(<OverwriteConfirm />, {
    useRedux: true,
    store: mockStore({ dashboardState: {} }),
  });
  expect(queryByText('Confirm overwrite')).not.toBeInTheDocument();
});

test('renders confirm modal on overwriteConfirmMetadata is provided', async () => {
  const { queryByText } = render(<OverwriteConfirm />, {
    useRedux: true,
    store: mockStore({
      dashboardState: {
        overwriteConfirmMetadata,
      },
    }),
  });
  await waitFor(() =>
    expect(queryByText('Confirm overwrite')).toBeInTheDocument(),
  );
});

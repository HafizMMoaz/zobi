import { NativeFilterType } from '@zobi.dev/core';
import { render, screen, waitFor } from 'spec/helpers/testing-library';
import HorizontalBar from './Horizontal';

const defaultProps = {
  actions: null,
  canEdit: true,
  dashboardId: 1,
  dataMaskSelected: {},
  filterValues: [],
  chartCustomizationValues: [],
  isInitialized: true,
  onSelectionChange: jest.fn(),
  onPendingCustomizationDataMaskChange: jest.fn(),
};

const renderWrapper = (overrideProps?: Record<string, any>) =>
  waitFor(() =>
    render(<HorizontalBar {...defaultProps} {...overrideProps} />, {
      useRedux: true,
      initialState: {
        dashboardState: {
          sliceIds: [],
        },
        dashboardInfo: {
          dash_edit_perm: true,
        },
        dashboardLayout: {
          present: {},
          past: [],
          future: [],
        },
      },
    }),
  );

test('should render', async () => {
  const { container } = await renderWrapper();
  expect(container).toBeInTheDocument();
});

test('should not render the empty message', async () => {
  await renderWrapper({
    filterValues: [
      {
        id: 'test',
        type: NativeFilterType.NativeFilter,
      },
    ],
  });
  expect(
    screen.queryByText('No filters are currently added to this dashboard.'),
  ).not.toBeInTheDocument();
});

test('should render the empty message', async () => {
  await renderWrapper();
  expect(
    screen.getByText('No filters are currently added to this dashboard.'),
  ).toBeInTheDocument();
});

test('should not render the loading icon', async () => {
  await renderWrapper();
  expect(
    screen.queryByRole('status', { name: 'Loading' }),
  ).not.toBeInTheDocument();
});

test('should render the loading icon', async () => {
  await renderWrapper({
    isInitialized: false,
  });
  expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
});

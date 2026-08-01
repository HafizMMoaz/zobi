
import { useState } from 'react';
import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { getMockStoreWithNativeFilters } from 'spec/fixtures/mockStore';
import chartQueries, { sliceId } from 'spec/fixtures/mockChartQueries';
import DrillDetailModal from './DrillDetailModal';

jest.mock('./DrillDetailPane', () => () => null);
const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const { id: chartId, form_data: formData } = chartQueries[sliceId];
const { slice_name: chartName } = formData;
const store = getMockStoreWithNativeFilters();
const drillToDetailModalState = {
  ...store.getState(),
  user: {
    ...store.getState().user,
    roles: { Admin: [['can_explore', 'Zobi']] },
  },
};

const renderModal = async (overrideState: Record<string, any> = {}) => {
  const DrillDetailModalWrapper = () => {
    const [showModal, setShowModal] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setShowModal(true)}>
          Show modal
        </button>
        <DrillDetailModal
          chartId={chartId}
          formData={formData}
          initialFilters={[]}
          showModal={showModal}
          onHideModal={() => setShowModal(false)}
        />
      </>
    );
  };

  render(<DrillDetailModalWrapper />, {
    useRouter: true,
    useRedux: true,
    initialState: {
      ...drillToDetailModalState,
      ...overrideState,
    },
  });

  userEvent.click(screen.getByRole('button', { name: 'Show modal' }));
  await screen.findByRole('dialog', { name: `Drill to detail: ${chartName}` });
};

test('should render the title', async () => {
  await renderModal();
  expect(screen.getByText(`Drill to detail: ${chartName}`)).toBeInTheDocument();
});

test('should render the button', async () => {
  await renderModal();
  expect(
    screen.getByRole('button', { name: 'Edit chart' }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
});

test('should close the modal', async () => {
  await renderModal();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  userEvent.click(screen.getAllByRole('button', { name: 'Close' })[1]);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('should forward to Explore', async () => {
  await renderModal();
  userEvent.click(screen.getByRole('button', { name: 'Edit chart' }));
  expect(mockHistoryPush).toHaveBeenCalledWith(
    `/explore/?dashboard_page_id=&slice_id=${sliceId}`,
  );
});

test('should render "Edit chart" as disabled without can_explore permission', async () => {
  await renderModal({
    user: {
      ...drillToDetailModalState.user,
      roles: { Admin: [['invalid_permission', 'Zobi']] },
    },
  });
  expect(screen.getByRole('button', { name: 'Edit chart' })).toBeDisabled();
});

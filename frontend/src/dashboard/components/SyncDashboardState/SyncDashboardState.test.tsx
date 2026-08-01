import { render } from 'spec/helpers/testing-library';
import { getItem, LocalStorageKeys } from 'src/utils/localStorageHelpers';
import SyncDashboardState from '.';

test('stores the dashboard info with local storages', () => {
  const testDashboardPageId = 'dashboardPageId';
  render(<SyncDashboardState dashboardPageId={testDashboardPageId} />, {
    useRedux: true,
  });
  expect(getItem(LocalStorageKeys.DashboardExploreContext, {})).toEqual({
    [testDashboardPageId]: expect.objectContaining({
      dashboardPageId: testDashboardPageId,
    }),
  });
});

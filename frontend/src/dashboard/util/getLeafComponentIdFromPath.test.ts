import getLeafComponentIdFromPath from 'src/dashboard/util/getLeafComponentIdFromPath';
import { filterId } from 'spec/fixtures/mockSliceEntities';
import { dashboardFilters } from 'spec/fixtures/mockDashboardFilters';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('getLeafComponentIdFromPath', () => {
  const path = dashboardFilters[filterId].directPathToFilter;
  const leaf = path.slice().pop();

  test('should return component id', () => {
    expect(getLeafComponentIdFromPath(path)).toBe(leaf);
  });

  test('should not return label component', () => {
    const updatedPath =
      dashboardFilters[filterId].directPathToFilter.concat('LABEL-test123');
    expect(getLeafComponentIdFromPath(updatedPath)).toBe(leaf);
  });
});

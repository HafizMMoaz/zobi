/* eslint-disable camelcase */
import {
  CHANGE_FILTER,
  UPDATE_DASHBOARD_FILTERS_SCOPE,
} from 'src/dashboard/actions/dashboardFilters';
import dashboardFiltersReducer, {
  DASHBOARD_FILTER_SCOPE_GLOBAL,
} from 'src/dashboard/reducers/dashboardFilters';
import * as activeDashboardFilters from 'src/dashboard/util/activeDashboardFilters';
import { dashboardFilters } from 'spec/fixtures/mockDashboardFilters';
import {
  sliceEntitiesForDashboard,
  filterId,
  column,
} from 'spec/fixtures/mockSliceEntities';
import { filterComponent } from 'spec/fixtures/mockDashboardLayout';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('dashboardFilters reducer', () => {
  const { form_data } = sliceEntitiesForDashboard.slices[filterId];
  const component = filterComponent;
  const directPathToFilter = (component.parents || []).slice();
  directPathToFilter.push(component.id);

  test('should overwrite a filter if merge is false', () => {
    expect(
      dashboardFiltersReducer(
        dashboardFilters as unknown as Parameters<
          typeof dashboardFiltersReducer
        >[0],
        {
          type: CHANGE_FILTER,
          chartId: filterId,
          newSelectedValues: {
            region: ['c'],
            gender: ['body', 'girl'],
          },
          merge: false,
        },
      ),
    ).toEqual({
      [filterId]: {
        chartId: filterId,
        componentId: component.id,
        directPathToFilter,
        isDateFilter: false,
        isInstantFilter: !!form_data.instant_filtering,
        columns: {
          region: ['c'],
          gender: ['body', 'girl'],
        },
        labels: {
          [column]: column,
        },
        scopes: {
          [column]: DASHBOARD_FILTER_SCOPE_GLOBAL,
          gender: DASHBOARD_FILTER_SCOPE_GLOBAL,
        },
      },
    });
  });

  test('should merge a filter if merge is true', () => {
    expect(
      dashboardFiltersReducer(
        dashboardFilters as unknown as Parameters<
          typeof dashboardFiltersReducer
        >[0],
        {
          type: CHANGE_FILTER,
          chartId: filterId,
          newSelectedValues: {
            region: ['c'],
            gender: ['body', 'girl'],
          },
          merge: true,
        },
      ),
    ).toEqual({
      [filterId]: {
        chartId: filterId,
        componentId: component.id,
        directPathToFilter,
        isDateFilter: false,
        isInstantFilter: !!form_data.instant_filtering,
        columns: {
          region: ['a', 'b', 'c'],
          gender: ['body', 'girl'],
        },
        labels: {
          [column]: column,
        },
        scopes: {
          region: DASHBOARD_FILTER_SCOPE_GLOBAL,
          gender: DASHBOARD_FILTER_SCOPE_GLOBAL,
        },
      },
    });
  });

  test('should buildActiveFilters on UPDATE_DASHBOARD_FILTERS_SCOPE', () => {
    const regionScope = {
      scope: ['TAB-1'],
      immune: [],
    };
    const genderScope = {
      scope: ['ROOT_ID'],
      immune: [1],
    };
    const scopes = {
      [`${filterId}_region`]: regionScope,
      [`${filterId}_gender`]: genderScope,
    };
    (activeDashboardFilters as Record<string, unknown>).buildActiveFilters =
      jest.fn();
    expect(
      dashboardFiltersReducer(
        dashboardFilters as unknown as Parameters<
          typeof dashboardFiltersReducer
        >[0],
        {
          type: UPDATE_DASHBOARD_FILTERS_SCOPE,
          scopes,
        },
      )[filterId].scopes,
    ).toEqual({
      region: regionScope,
      gender: genderScope,
    });

    // when UPDATE_DASHBOARD_FILTERS_SCOPE is changed, applicable filters to a chart
    // might be changed.
    expect(activeDashboardFilters.buildActiveFilters).toHaveBeenCalled();
  });
});

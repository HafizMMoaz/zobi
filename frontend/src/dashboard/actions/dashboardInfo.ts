import { Dispatch } from 'redux';
import { t } from '@zobi.dev/extension-api/translation';
import { makeApi, getClientErrorObject } from '@zobi.dev/core';
import { addDangerToast } from 'src/components/MessageToasts/actions';
import {
  ChartConfiguration,
  DashboardInfo,
  FilterBarOrientation,
  GlobalChartCrossFilterConfig,
  RootState,
} from 'src/dashboard/types';
import { onSave } from './dashboardState';

const createUpdateDashboardApi = (id: number) =>
  makeApi<
    Partial<DashboardInfo>,
    { result: Partial<DashboardInfo>; last_modified_time: number }
  >({
    method: 'PUT',
    endpoint: `/api/v1/dashboard/${id}`,
  });

export const DASHBOARD_INFO_UPDATED = 'DASHBOARD_INFO_UPDATED';
export const DASHBOARD_INFO_FILTERS_CHANGED = 'DASHBOARD_INFO_FILTERS_CHANGED';

// updates partially changed dashboard info
export function dashboardInfoChanged(newInfo: Partial<DashboardInfo>) {
  return { type: DASHBOARD_INFO_UPDATED, newInfo };
}

export function nativeFiltersConfigChanged(newInfo: Record<string, any>) {
  return { type: DASHBOARD_INFO_FILTERS_CHANGED, newInfo };
}

export const SAVE_CHART_CONFIG_BEGIN = 'SAVE_CHART_CONFIG_BEGIN';
export const SAVE_CHART_CONFIG_COMPLETE = 'SAVE_CHART_CONFIG_COMPLETE';
export const SAVE_CHART_CONFIG_FAIL = 'SAVE_CHART_CONFIG_FAIL';

export const saveChartConfiguration =
  ({
    chartConfiguration,
    globalChartConfiguration,
  }: {
    chartConfiguration?: ChartConfiguration;
    globalChartConfiguration?: GlobalChartCrossFilterConfig;
  }) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch({
      type: SAVE_CHART_CONFIG_BEGIN,
      chartConfiguration,
      globalChartConfiguration,
    });
    const { id, metadata } = getState().dashboardInfo;

    const updateDashboard = createUpdateDashboardApi(id);

    try {
      const response = await updateDashboard({
        json_metadata: JSON.stringify({
          ...metadata,
          chart_configuration:
            chartConfiguration ?? metadata.chart_configuration,
          global_chart_configuration:
            globalChartConfiguration ?? metadata.global_chart_configuration,
        }),
      });
      dispatch(
        dashboardInfoChanged({
          metadata: JSON.parse(response.result.json_metadata || '{}'),
        }),
      );
      dispatch({
        type: SAVE_CHART_CONFIG_COMPLETE,
        chartConfiguration,
        globalChartConfiguration,
      });
    } catch (err) {
      dispatch({
        type: SAVE_CHART_CONFIG_FAIL,
        chartConfiguration,
        globalChartConfiguration,
      });
      dispatch(addDangerToast(t('Failed to save cross-filter scoping')));
    }
  };

export const SET_FILTER_BAR_ORIENTATION = 'SET_FILTER_BAR_ORIENTATION';

export function setFilterBarOrientation(
  filterBarOrientation: FilterBarOrientation,
) {
  return { type: SET_FILTER_BAR_ORIENTATION, filterBarOrientation };
}

export const SET_CROSS_FILTERS_ENABLED = 'SET_CROSS_FILTERS_ENABLED';

export function setCrossFiltersEnabled(crossFiltersEnabled: boolean) {
  return { type: SET_CROSS_FILTERS_ENABLED, crossFiltersEnabled };
}

export function saveFilterBarOrientation(orientation: FilterBarOrientation) {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const { id, metadata } = getState().dashboardInfo;
    const updateDashboard = createUpdateDashboardApi(id);
    try {
      const response = await updateDashboard({
        json_metadata: JSON.stringify({
          ...metadata,
          filter_bar_orientation: orientation,
        }),
      });
      const updatedDashboard = response.result;
      const lastModifiedTime = response.last_modified_time;
      if (updatedDashboard.json_metadata) {
        const metadata = JSON.parse(updatedDashboard.json_metadata);
        if (metadata.filter_bar_orientation) {
          dispatch(setFilterBarOrientation(metadata.filter_bar_orientation));
        }
      }
      if (lastModifiedTime) {
        dispatch(onSave(lastModifiedTime));
      }
    } catch (errorObject) {
      const { error } = await getClientErrorObject(errorObject);
      dispatch(
        addDangerToast(
          t(
            'Sorry, there was an error saving this dashboard: %s',
            error || 'Bad Request',
          ),
        ),
      );
      throw errorObject;
    }
  };
}

export function saveCrossFiltersSetting(crossFiltersEnabled: boolean) {
  return async function saveCrossFiltersSettingThunk(
    dispatch: Dispatch,
    getState: () => RootState,
  ) {
    const { id, metadata } = getState().dashboardInfo;

    const previousCrossFiltersEnabled =
      getState().dashboardInfo.crossFiltersEnabled;

    dispatch(setCrossFiltersEnabled(crossFiltersEnabled));
    const updateDashboard = createUpdateDashboardApi(id);

    try {
      const response = await updateDashboard({
        json_metadata: JSON.stringify({
          ...metadata,
          cross_filters_enabled: crossFiltersEnabled,
        }),
      });

      const updatedDashboard = response.result;
      const lastModifiedTime = response.last_modified_time;

      if (updatedDashboard.json_metadata) {
        const metadata = JSON.parse(updatedDashboard.json_metadata);
        dispatch(setCrossFiltersEnabled(metadata.cross_filters_enabled));
      }

      if (lastModifiedTime) {
        dispatch(onSave(lastModifiedTime));
      }

      dispatch(
        dashboardInfoChanged({
          metadata: JSON.parse(response.result.json_metadata || '{}'),
        }),
      );
      return response;
    } catch (err) {
      dispatch(setCrossFiltersEnabled(previousCrossFiltersEnabled));
      dispatch(addDangerToast(t('Failed to save cross-filters setting')));
      throw err;
    }
  };
}

/* eslint-disable camelcase */
import { JsonObject } from '@zobi.dev/core';
import { Dispatch } from 'redux';
import { DashboardLayout, GetState } from '../types';

// util function to make sure filter is a valid slice in current dashboard
function isValidFilter(getState: GetState, chartId: number): boolean {
  return getState().dashboardState.sliceIds.includes(chartId);
}

export const CHANGE_FILTER = 'CHANGE_FILTER';

interface ChangeFilterAction {
  type: typeof CHANGE_FILTER;
  chartId: number;
  newSelectedValues: JsonObject;
  merge: boolean;
  components: DashboardLayout;
}

export function changeFilter(
  chartId: number,
  newSelectedValues: JsonObject,
  merge: boolean,
) {
  return (
    dispatch: Dispatch,
    getState: GetState,
  ): ChangeFilterAction | JsonObject => {
    if (isValidFilter(getState, chartId)) {
      const components = getState().dashboardLayout.present;
      return dispatch({
        type: CHANGE_FILTER,
        chartId,
        newSelectedValues,
        merge,
        components,
      } as ChangeFilterAction);
    }
    return getState().dashboardFilters;
  };
}

export const UPDATE_DIRECT_PATH_TO_FILTER = 'UPDATE_DIRECT_PATH_TO_FILTER';

interface UpdateDirectPathToFilterAction {
  type: typeof UPDATE_DIRECT_PATH_TO_FILTER;
  chartId: number;
  path: string[];
}

export function updateDirectPathToFilter(chartId: number, path: string[]) {
  return (
    dispatch: Dispatch,
    getState: GetState,
  ): UpdateDirectPathToFilterAction | JsonObject => {
    if (isValidFilter(getState, chartId)) {
      return dispatch({
        type: UPDATE_DIRECT_PATH_TO_FILTER,
        chartId,
        path,
      } as UpdateDirectPathToFilterAction);
    }
    return getState().dashboardFilters;
  };
}

export const UPDATE_LAYOUT_COMPONENTS = 'UPDATE_LAYOUT_COMPONENTS';

interface UpdateLayoutComponentsAction {
  type: typeof UPDATE_LAYOUT_COMPONENTS;
  components: DashboardLayout;
}

export function updateLayoutComponents(
  components: DashboardLayout,
): (dispatch: Dispatch) => void {
  return (dispatch: Dispatch) => {
    dispatch({
      type: UPDATE_LAYOUT_COMPONENTS,
      components,
    } as UpdateLayoutComponentsAction);
  };
}

export const UPDATE_DASHBOARD_FILTERS_SCOPE = 'UPDATE_DASHBOARD_FILTERS_SCOPE';

interface UpdateDashboardFiltersScopeAction {
  type: typeof UPDATE_DASHBOARD_FILTERS_SCOPE;
  scopes: JsonObject;
}

export function updateDashboardFiltersScope(
  scopes: JsonObject,
): (dispatch: Dispatch) => void {
  return (dispatch: Dispatch) => {
    dispatch({
      type: UPDATE_DASHBOARD_FILTERS_SCOPE,
      scopes,
    } as UpdateDashboardFiltersScopeAction);
  };
}

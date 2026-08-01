/* eslint camelcase: 0 */
import { ZobiClient } from '@zobi-ui/core';
import { t } from '@zobi/core/translation';
import rison from 'rison';
import {
  addDangerToast,
  addSuccessToast,
} from 'src/components/MessageToasts/actions';
import { isEmpty } from 'lodash';
import { Dispatch, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ReportObject, ReportCreationMethod } from 'src/features/reports/types';
import { DashboardInfo, ChartsState } from 'src/dashboard/types';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import { ExplorePageState } from 'src/explore/types';

// Type definitions for report-related state
interface ReportApiResponse {
  result?: ReportObject[];
}

interface ReportApiJsonResponse {
  result: Partial<ReportObject>;
  id: number;
}

interface ReportRootState {
  user: UserWithPermissionsAndRoles;
  dashboardInfo: DashboardInfo;
  charts: ChartsState;
  explore: ExplorePageState['explore'] & {
    user?: UserWithPermissionsAndRoles;
  };
}

type ReportFilterField = 'dashboard_id' | 'chart_id';

export const SET_REPORT = 'SET_REPORT' as const;

export interface SetReportAction {
  type: typeof SET_REPORT;
  report: ReportApiResponse;
  resourceId: number;
  creationMethod: ReportCreationMethod;
  filterField: ReportFilterField;
}

export function setReport(
  report: ReportApiResponse,
  resourceId: number,
  creationMethod: ReportCreationMethod,
  filterField: ReportFilterField,
): SetReportAction {
  return { type: SET_REPORT, report, resourceId, creationMethod, filterField };
}

interface FetchUISpecificReportParams {
  userId: number | undefined;
  filterField: ReportFilterField;
  creationMethod: ReportCreationMethod;
  resourceId: number;
}

export function fetchUISpecificReport({
  userId,
  filterField,
  creationMethod,
  resourceId,
}: FetchUISpecificReportParams) {
  const queryParams = rison.encode({
    filters: [
      {
        col: filterField,
        opr: 'eq',
        value: resourceId,
      },
      {
        col: 'creation_method',
        opr: 'eq',
        value: creationMethod,
      },
      {
        col: 'created_by',
        opr: 'rel_o_m',
        value: userId,
      },
    ],
  });
  return function fetchUISpecificReportThunk(dispatch: Dispatch<AnyAction>) {
    return ZobiClient.get({
      endpoint: `/api/v1/report/?q=${queryParams}`,
    })
      .then(({ json }) => {
        dispatch(
          setReport(
            json as ReportApiResponse,
            resourceId,
            creationMethod,
            filterField,
          ),
        );
      })
      .catch(() =>
        dispatch(addDangerToast(t('There was an issue fetching reports.'))),
      );
  };
}

const structureFetchAction = (
  dispatch: ThunkDispatch<ReportRootState, unknown, AnyAction>,
  getState: () => ReportRootState,
) => {
  const state = getState();
  const { user, dashboardInfo, charts, explore } = state;
  if (!isEmpty(dashboardInfo)) {
    dispatch(
      fetchUISpecificReport({
        userId: user.userId,
        filterField: 'dashboard_id',
        creationMethod: 'dashboards',
        resourceId: dashboardInfo.id,
      }),
    );
  } else if (!isEmpty(charts)) {
    const [chartArr] = Object.keys(charts);
    dispatch(
      fetchUISpecificReport({
        userId: explore.user?.userId || user?.userId,
        filterField: 'chart_id',
        creationMethod: 'charts',
        resourceId: charts[chartArr].id,
      }),
    );
  }
};

export const ADD_REPORT = 'ADD_REPORT' as const;

export interface AddReportAction {
  type: typeof ADD_REPORT;
  json: ReportApiJsonResponse;
}

export const addReport =
  (report: Partial<ReportObject>) => (dispatch: Dispatch<AnyAction>) =>
    ZobiClient.post({
      endpoint: `/api/v1/report/`,
      jsonPayload: report,
    })
      .then(({ json }) => {
        dispatch({ type: ADD_REPORT, json } as AddReportAction);
        dispatch(addSuccessToast(t('The report has been created')));
      })
      .catch(err => {
        dispatch(addDangerToast(t('Failed to create report')));
        throw err;
      });

export const SUBSCRIBE_REPORT = 'SUBSCRIBE_REPORT' as const;

export interface SubscribeReportAction {
  type: typeof SUBSCRIBE_REPORT;
  json: ReportApiJsonResponse;
}

export const subscribeReport =
  (report: Partial<ReportObject>) => (dispatch: Dispatch<AnyAction>) =>
    ZobiClient.post({
      endpoint: `/api/v1/report/subscribe`,
      jsonPayload: report,
    })
      .then(({ json }) => {
        dispatch({ type: SUBSCRIBE_REPORT, json } as SubscribeReportAction);
        dispatch(addSuccessToast(t('The report has been created')));
      })
      .catch(err => {
        dispatch(addDangerToast(t('Failed to create report')));
        throw err;
      });

export const EDIT_REPORT = 'EDIT_REPORT' as const;

export interface EditReportAction {
  type: typeof EDIT_REPORT;
  json: ReportApiJsonResponse;
}

export const editReport =
  (id: number, report: Partial<ReportObject>) =>
  (dispatch: Dispatch<AnyAction>) =>
    ZobiClient.put({
      endpoint: `/api/v1/report/${id}`,
      jsonPayload: report,
    })
      .then(({ json }) => {
        dispatch({ type: EDIT_REPORT, json } as EditReportAction);
        dispatch(addSuccessToast(t('Report updated')));
      })
      .catch(err => {
        dispatch(addDangerToast(t('Failed to update report')));
        throw err;
      });

export function toggleActive(report: ReportObject, isActive: boolean) {
  return function toggleActiveThunk(
    dispatch: ThunkDispatch<ReportRootState, unknown, AnyAction>,
  ) {
    return ZobiClient.put({
      endpoint: encodeURI(`/api/v1/report/${report.id}`),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        active: isActive,
      }),
    })
      .catch(() => {
        dispatch(
          addDangerToast(
            t('We were unable to activate or deactivate this report.'),
          ),
        );
      })
      .finally(() => {
        dispatch(structureFetchAction);
      });
  };
}

export const DELETE_REPORT = 'DELETE_REPORT' as const;

/** Minimal fields required to delete a report/alert */
export interface DeletableReport {
  id?: number;
  name?: string;
  creation_method?: string;
  dashboard?: number;
  chart?: number;
}

export interface DeleteReportAction {
  type: typeof DELETE_REPORT;
  report: DeletableReport;
}

export function deleteActiveReport(report: DeletableReport) {
  return function deleteActiveReportThunk(dispatch: Dispatch<AnyAction>) {
    return ZobiClient.delete({
      endpoint: encodeURI(`/api/v1/report/${report.id}`),
    })
      .then(() => {
        dispatch({ type: DELETE_REPORT, report } as DeleteReportAction);
        dispatch(addSuccessToast(t('Deleted: %s', report.name)));
      })
      .catch(() => {
        dispatch(addDangerToast(t('Your report could not be deleted')));
      });
  };
}

export type ReportAction =
  | SetReportAction
  | AddReportAction
  | SubscribeReportAction
  | EditReportAction
  | DeleteReportAction;

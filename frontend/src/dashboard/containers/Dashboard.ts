import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { RootState } from 'src/dashboard/types';
import Dashboard from 'src/dashboard/components/Dashboard';
import {
  addSliceToDashboard,
  removeSliceFromDashboard,
  clearAllChartStates,
} from 'src/dashboard/actions/dashboardState';
import { setDatasources } from 'src/dashboard/actions/datasources';

import { triggerQuery } from 'src/components/Chart/chartAction';
import { logEvent } from 'src/logger/actions';
import { clearDataMaskState } from '../../dataMask/actions';

function mapStateToProps(state: RootState) {
  const {
    datasources,
    sliceEntities,
    dashboardInfo,
    dashboardState,
    dashboardLayout,
    impressionId,
  } = state;

  return {
    timeout: dashboardInfo.common?.conf?.ZOBI_WEBSERVER_TIMEOUT,
    userId: dashboardInfo.userId,
    dashboardId: dashboardInfo.id,
    editMode: dashboardState.editMode,
    isPublished: dashboardState.isPublished,
    hasUnsavedChanges: dashboardState.hasUnsavedChanges,
    datasources,
    chartConfiguration: dashboardInfo.metadata?.chart_configuration,
    slices: sliceEntities.slices,
    layout: dashboardLayout.present,
    impressionId,
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    actions: bindActionCreators(
      {
        setDatasources,
        clearDataMaskState,
        clearAllChartStates,
        addSliceToDashboard,
        removeSliceFromDashboard,
        triggerQuery,
        logEvent,
      },
      dispatch,
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

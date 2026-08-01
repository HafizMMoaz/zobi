import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import DashboardGrid from '../components/DashboardGrid';

import {
  handleComponentDrop,
  resizeComponent,
} from '../actions/dashboardLayout';
import { setDirectPathToChild, setEditMode } from '../actions/dashboardState';
import { RootState } from 'src/dashboard/types';

function mapStateToProps({ dashboardState, dashboardInfo }: RootState) {
  return {
    editMode: dashboardState.editMode,
    canEdit: dashboardInfo.dash_edit_perm,
    dashboardId: dashboardInfo.id,
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      handleComponentDrop,
      resizeComponent,
      setDirectPathToChild,
      setEditMode,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardGrid);

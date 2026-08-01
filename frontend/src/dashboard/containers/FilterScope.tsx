import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { updateDashboardFiltersScope } from '../actions/dashboardFilters';
import { setUnsavedChanges } from '../actions/dashboardState';
import FilterScopeSelector from '../components/filterscope/FilterScopeSelector';
import { RootState } from 'src/dashboard/types';

function mapStateToProps({ dashboardLayout, dashboardFilters }: RootState) {
  return {
    dashboardFilters,
    layout: dashboardLayout.present,
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      updateDashboardFiltersScope,
      setUnsavedChanges,
    },
    dispatch,
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FilterScopeSelector);

import { bindActionCreators, Dispatch, AnyAction } from 'redux';
import { connect } from 'react-redux';
import { fetchSlices, updateSlices } from '../actions/sliceEntities';
import SliceAdder from '../components/SliceAdder';
import { RootState } from 'src/dashboard/types';

interface OwnProps {
  height?: number;
}

function mapStateToProps(
  { sliceEntities, dashboardInfo, dashboardState }: RootState,
  ownProps: OwnProps,
) {
  return {
    height: ownProps.height,
    userId: +dashboardInfo.userId,
    dashboardId: dashboardInfo.id,
    selectedSliceIds: dashboardState.sliceIds,
    slices: sliceEntities.slices,
    isLoading: sliceEntities.isLoading,
    errorMessage: sliceEntities.errorMessage,
    lastUpdated: sliceEntities.lastUpdated,
    editMode: dashboardState.editMode,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      fetchSlices,
      updateSlices,
    } as any,
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SliceAdder as any);

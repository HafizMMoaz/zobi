import { connect } from 'react-redux';
import { bindActionCreators, Dispatch, AnyAction } from 'redux';

import * as actions from './chartAction';
import { logEvent } from '../../logger/actions';
import Chart from './Chart';
import { updateDataMask } from '../../dataMask/actions';

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    actions: bindActionCreators(
      {
        ...actions,
        updateDataMask,
        logEvent,
      } as any,
      dispatch,
    ),
  };
}

export default connect(null, mapDispatchToProps)(Chart);

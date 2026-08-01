import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ToastPresenter from './ToastPresenter';

import { removeToast } from './actions';

const ToastContainer = connect(
  ({ messageToasts: toasts }: any) => ({ toasts }),
  dispatch => bindActionCreators({ removeToast }, dispatch),
)(ToastPresenter);

export default ToastContainer;

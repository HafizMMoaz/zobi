
import { ComponentType, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useDispatch } from 'react-redux';

import {
  addDangerToast,
  addInfoToast,
  addSuccessToast,
  addWarningToast,
} from './actions';

export interface ToastProps {
  addDangerToast: typeof addDangerToast;
  addInfoToast: typeof addInfoToast;
  addSuccessToast: typeof addSuccessToast;
  addWarningToast: typeof addWarningToast;
}

/** just action creators, these do not dispatch */
export const toasters = {
  addInfoToast,
  addSuccessToast,
  addWarningToast,
  addDangerToast,
};

// To work properly the redux state must have a `messageToasts` subtree
export default function withToasts(BaseComponent: ComponentType<any>) {
  return connect(null, dispatch => bindActionCreators(toasters, dispatch))(
    BaseComponent,
  ) as any;
  // Redux has some confusing typings that cause problems for consumers of this function.
  // If someone can fix the types, great, but for now it's just any.
}

export function useToasts() {
  const dispatch = useDispatch();
  return useMemo(() => bindActionCreators(toasters, dispatch), [dispatch]);
}

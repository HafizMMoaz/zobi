import { ADD_TOAST, REMOVE_TOAST } from './actions';
import { ToastMeta } from './types';

interface AddToastAction {
  type: typeof ADD_TOAST;
  payload: ToastMeta;
}

interface RemoveToastAction {
  type: typeof REMOVE_TOAST;
  payload: {
    id: string;
  };
}

type ToastAction = AddToastAction | RemoveToastAction;

export default function messageToastsReducer(
  toasts: ToastMeta[] = [],
  action: ToastAction,
): ToastMeta[] {
  switch (action.type) {
    case ADD_TOAST: {
      const { payload: toast } = action;
      const result = toasts.slice();
      if (!toast.noDuplicate || !result.some(x => x.text === toast.text)) {
        return [toast, ...toasts];
      }
      return toasts;
    }

    case REMOVE_TOAST: {
      const {
        payload: { id },
      } = action;
      return [...toasts].filter(toast => toast.id !== id);
    }

    default:
      return toasts;
  }
}

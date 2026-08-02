import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logEvent } from 'src/logger/actions';

export default function useLogAction(staticEventData: Record<string, any>) {
  const dispatch = useDispatch();
  const logAction = useCallback<typeof logEvent>(
    (type, payload) =>
      dispatch(
        logEvent(type, {
          payload: {
            ...staticEventData,
            ...payload,
          },
        }),
      ),
    [staticEventData, dispatch],
  );

  return logAction;
}

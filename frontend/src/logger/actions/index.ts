import { Dispatch } from 'redux';

export const LOG_EVENT = 'LOG_EVENT';

export function logEvent(eventName: string, eventData: Record<string, any>) {
  return (dispatch: Dispatch) =>
    dispatch({
      type: LOG_EVENT,
      payload: {
        eventName,
        eventData,
      },
    });
}

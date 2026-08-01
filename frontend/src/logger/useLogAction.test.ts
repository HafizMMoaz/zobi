import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderHook } from '@testing-library/react';
import { createWrapper } from 'spec/helpers/testing-library';
import useLogAction from './useLogAction';
import { LOG_ACTIONS_SQLLAB_COPY_LINK } from './LogUtils';
import { LOG_EVENT } from './actions';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

test('dispatches logEvent action with static EventData', () => {
  const staticEventData = { staticEventKey: 'value1' };
  const store = mockStore();
  const { result } = renderHook(() => useLogAction(staticEventData), {
    wrapper: createWrapper({
      useRedux: true,
      store,
    }),
  });
  result.current(LOG_ACTIONS_SQLLAB_COPY_LINK, { count: 1 });
  store.getActions();
  expect(store.getActions()).toEqual([
    {
      type: LOG_EVENT,
      payload: {
        eventName: LOG_ACTIONS_SQLLAB_COPY_LINK,
        eventData: {
          payload: {
            ...staticEventData,
            count: 1,
          },
        },
      },
    },
  ]);
});

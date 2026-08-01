import { isValidElement } from 'react';
import { AnyAction, combineReducers } from 'redux';
import Mousetrap from 'mousetrap';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render } from 'spec/helpers/testing-library';

import App from 'src/SqlLab/components/App';
import reducers from 'spec/helpers/reducerIndex';
import { LOCALSTORAGE_MAX_USAGE_KB } from 'src/SqlLab/constants';
import { LOG_EVENT } from 'src/logger/actions';
import {
  LOG_ACTIONS_SQLLAB_WARN_LOCAL_STORAGE_USAGE,
  LOG_ACTIONS_SQLLAB_MONITOR_LOCAL_STORAGE_USAGE,
} from 'src/logger/LogUtils';

// eslint-disable-next-line react/display-name
jest.mock('src/SqlLab/components/PopEditorTab', () => () => (
  <div data-test="mock-pop-editor-tab" />
));
// eslint-disable-next-line react/display-name
jest.mock('src/SqlLab/components/QueryAutoRefresh', () => () => (
  <div data-test="mock-query-auto-refresh" />
));
jest.mock('mousetrap', () => ({
  reset: jest.fn(),
}));

const sqlLabReducer = combineReducers({
  localStorageUsageInKilobytes: reducers.localStorageUsageInKilobytes,
});
const mockAction = {} as AnyAction;

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('SqlLab App', () => {
  const middlewares = [thunk];
  const mockStore = configureStore(middlewares);
  const store = mockStore(sqlLabReducer(undefined, mockAction));

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('is valid', () => {
    expect(isValidElement(<App />)).toBe(true);
  });

  test('should render', () => {
    const { getByTestId } = render(<App />, { useRedux: true, store });
    expect(getByTestId('SqlLabApp')).toBeInTheDocument();
    expect(getByTestId('mock-pop-editor-tab')).toBeInTheDocument();
  });

  test('reset hotkey events on unmount', () => {
    const { unmount } = render(<App />, { useRedux: true, store });
    unmount();
    expect(Mousetrap.reset).toHaveBeenCalled();
  });

  test('logs current usage warning', () => {
    const localStorageUsageInKilobytes = LOCALSTORAGE_MAX_USAGE_KB + 10;
    const initialState = {
      localStorageUsageInKilobytes,
    };
    const storeExceedLocalStorage = mockStore(
      sqlLabReducer(initialState, mockAction),
    );

    const { rerender } = render(<App />, {
      useRedux: true,
      store: storeExceedLocalStorage,
    });
    rerender(<App updated />);
    expect(storeExceedLocalStorage.getActions()).toContainEqual(
      expect.objectContaining({
        type: LOG_EVENT,
        payload: expect.objectContaining({
          eventName: LOG_ACTIONS_SQLLAB_WARN_LOCAL_STORAGE_USAGE,
        }),
      }),
    );
  });

  test('logs current local storage usage', async () => {
    const localStorageUsageInKilobytes = LOCALSTORAGE_MAX_USAGE_KB - 10;
    const storeExceedLocalStorage = mockStore(
      sqlLabReducer(
        {
          localStorageUsageInKilobytes,
        },
        mockAction,
      ),
    );

    const { rerender } = render(<App />, {
      useRedux: true,
      store: storeExceedLocalStorage,
    });
    rerender(<App updated />);
    expect(storeExceedLocalStorage.getActions()).toContainEqual(
      expect.objectContaining({
        type: LOG_EVENT,
        payload: expect.objectContaining({
          eventName: LOG_ACTIONS_SQLLAB_MONITOR_LOCAL_STORAGE_USAGE,
          eventData: expect.objectContaining({
            current_usage: localStorageUsageInKilobytes,
          }),
        }),
      }),
    );
  });
});

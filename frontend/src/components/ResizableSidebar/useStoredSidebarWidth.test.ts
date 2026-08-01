import { renderHook, act } from '@testing-library/react';
import {
  LocalStorageKeys,
  setItem,
  getItem,
} from 'src/utils/localStorageHelpers';
import useStoredSidebarWidth from './useStoredSidebarWidth';

const INITIAL_WIDTH = 300;

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('useStoredSidebarWidth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterAll(() => {
    localStorage.clear();
  });

  test('returns a default filterBar width by initialWidth', () => {
    const id = '123';
    const { result } = renderHook(() =>
      useStoredSidebarWidth(id, INITIAL_WIDTH),
    );
    const [actualWidth] = result.current;

    expect(actualWidth).toEqual(INITIAL_WIDTH);
  });

  test('returns a stored filterBar width from localStorage', () => {
    const id = '123';
    const expectedWidth = 378;
    setItem(LocalStorageKeys.CommonResizableSidebarWidths, {
      [id]: expectedWidth,
      '456': 250,
    });
    const { result } = renderHook(() =>
      useStoredSidebarWidth(id, INITIAL_WIDTH),
    );
    const [actualWidth] = result.current;

    expect(actualWidth).toEqual(expectedWidth);
    expect(actualWidth).not.toEqual(250);
  });

  test('returns a setter for filterBar width that stores the state in localStorage together', () => {
    const id = '123';
    const expectedWidth = 378;
    const otherDashboardId = '456';
    const otherDashboardWidth = 253;
    setItem(LocalStorageKeys.CommonResizableSidebarWidths, {
      [id]: 300,
      [otherDashboardId]: otherDashboardWidth,
    });
    const { result } = renderHook(() =>
      useStoredSidebarWidth(id, INITIAL_WIDTH),
    );
    const [prevWidth, setter] = result.current;

    expect(prevWidth).toEqual(300);

    act(() => setter(expectedWidth));

    const updatedWidth = result.current[0];
    const widthsMap = getItem(
      LocalStorageKeys.CommonResizableSidebarWidths,
      {},
    );
    expect(widthsMap[id]).toEqual(expectedWidth);
    expect(widthsMap[otherDashboardId]).toEqual(otherDashboardWidth);
    expect(updatedWidth).toEqual(expectedWidth);
    expect(updatedWidth).not.toEqual(250);
  });
});

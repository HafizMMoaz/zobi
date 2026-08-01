import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import {
  AutoRefreshProvider,
  useAutoRefreshContext,
  useIsAutoRefreshing,
  useIsRefreshInFlight,
} from './AutoRefreshContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AutoRefreshProvider>{children}</AutoRefreshProvider>
);

test('provides default value of false when not inside provider', () => {
  const { result } = renderHook(() => useIsAutoRefreshing());
  expect(result.current).toBe(false);
});

test('provides default refresh in-flight value of false when not inside provider', () => {
  const { result } = renderHook(() => useIsRefreshInFlight());
  expect(result.current).toBe(false);
});

test('isAutoRefreshing starts as false inside provider', () => {
  const { result } = renderHook(() => useAutoRefreshContext(), { wrapper });
  expect(result.current.isAutoRefreshing).toBe(false);
});

test('isRefreshInFlight starts as false inside provider', () => {
  const { result } = renderHook(() => useAutoRefreshContext(), { wrapper });
  expect(result.current.isRefreshInFlight).toBe(false);
});

test('startAutoRefresh sets isAutoRefreshing to true', () => {
  const { result } = renderHook(() => useAutoRefreshContext(), { wrapper });

  act(() => {
    result.current.startAutoRefresh();
  });

  expect(result.current.isAutoRefreshing).toBe(true);
});

test('endAutoRefresh sets isAutoRefreshing to false', () => {
  const { result } = renderHook(() => useAutoRefreshContext(), { wrapper });

  act(() => {
    result.current.startAutoRefresh();
  });
  expect(result.current.isAutoRefreshing).toBe(true);

  act(() => {
    result.current.endAutoRefresh();
  });
  expect(result.current.isAutoRefreshing).toBe(false);
});

test('setIsAutoRefreshing sets the value directly', () => {
  const { result } = renderHook(() => useAutoRefreshContext(), { wrapper });

  act(() => {
    result.current.setIsAutoRefreshing(true);
  });
  expect(result.current.isAutoRefreshing).toBe(true);

  act(() => {
    result.current.setIsAutoRefreshing(false);
  });
  expect(result.current.isAutoRefreshing).toBe(false);
});

test('setRefreshInFlight sets the value directly', () => {
  const { result } = renderHook(() => useAutoRefreshContext(), { wrapper });

  act(() => {
    result.current.setRefreshInFlight(true);
  });
  expect(result.current.isRefreshInFlight).toBe(true);

  act(() => {
    result.current.setRefreshInFlight(false);
  });
  expect(result.current.isRefreshInFlight).toBe(false);
});

test('useIsAutoRefreshing hook returns correct value inside provider', () => {
  const { result } = renderHook(
    () => ({
      context: useAutoRefreshContext(),
      isAutoRefreshing: useIsAutoRefreshing(),
    }),
    { wrapper },
  );

  expect(result.current.isAutoRefreshing).toBe(false);

  act(() => {
    result.current.context.startAutoRefresh();
  });
  expect(result.current.isAutoRefreshing).toBe(true);
});

test('useIsRefreshInFlight hook returns correct value inside provider', () => {
  const { result } = renderHook(
    () => ({
      context: useAutoRefreshContext(),
      isRefreshInFlight: useIsRefreshInFlight(),
    }),
    { wrapper },
  );

  expect(result.current.isRefreshInFlight).toBe(false);

  act(() => {
    result.current.context.setRefreshInFlight(true);
  });

  expect(result.current.isRefreshInFlight).toBe(true);
});

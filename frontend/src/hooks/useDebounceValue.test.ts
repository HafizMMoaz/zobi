import { act, renderHook } from '@testing-library/react';
import { useDebounceValue } from './useDebounceValue';

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('should return the initial value', () => {
  const { result } = renderHook(() => useDebounceValue('hello'));
  expect(result.current).toBe('hello');
});

test('should update debounced value after delay', async () => {
  jest.useFakeTimers();
  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounceValue(value, delay),
    { initialProps: { value: 'hello', delay: 1000 } },
  );

  expect(result.current).toBe('hello');
  act(() => {
    rerender({ value: 'world', delay: 1000 });
    jest.advanceTimersByTime(500);
  });

  expect(result.current).toBe('hello');

  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(result.current).toBe('world');
});

test('should cancel previous timeout when value changes', async () => {
  jest.useFakeTimers();
  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounceValue(value, delay),
    { initialProps: { value: 'hello', delay: 1000 } },
  );

  expect(result.current).toBe('hello');
  rerender({ value: 'world', delay: 1000 });

  jest.advanceTimersByTime(500);
  rerender({ value: 'foo', delay: 1000 });

  jest.advanceTimersByTime(500);
  expect(result.current).toBe('hello');
});

test('should cancel the timeout when unmounting', async () => {
  jest.useFakeTimers();
  jest.spyOn(global, 'clearTimeout');
  const { result, unmount } = renderHook(() => useDebounceValue('hello', 1000));

  expect(result.current).toBe('hello');
  unmount();

  jest.advanceTimersByTime(1000);
  expect(clearTimeout).toHaveBeenCalled();
});

import { renderHook } from '@testing-library/react';
import { usePrevious } from './usePrevious';

test('get undefined on the first render when initialValue is not defined', () => {
  const hook = renderHook(() => usePrevious('state'));
  expect(hook.result.current).toBeUndefined();
});

test('get initial value on the first render when initialValue is defined', () => {
  const hook = renderHook(() => usePrevious('state', 'initial'));
  expect(hook.result.current).toBe('initial');
});

test('get state value on second render', () => {
  const hook = renderHook(() => usePrevious('state', 'initial'));
  hook.rerender(() => usePrevious('state'));
  expect(hook.result.current).toBe('state');
});

test('get state value on third render', () => {
  const hook = renderHook(() => usePrevious('state'));
  hook.rerender(() => usePrevious('state'));
  hook.rerender(() => usePrevious('state-2'));
  expect(hook.result.current).toBe('state');
});

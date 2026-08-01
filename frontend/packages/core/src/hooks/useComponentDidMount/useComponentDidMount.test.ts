import { renderHook } from '@testing-library/react';
import { useComponentDidMount } from './useComponentDidMount';

test('the effect should only be executed on the first render', () => {
  const effect = jest.fn();
  const hook = renderHook(() => useComponentDidMount(effect));
  expect(effect).toHaveBeenCalledTimes(1);
  hook.rerender();
  expect(effect).toHaveBeenCalledTimes(1);
});

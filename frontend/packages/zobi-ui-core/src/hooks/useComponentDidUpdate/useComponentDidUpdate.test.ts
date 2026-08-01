import { renderHook } from '@testing-library/react';
import { useComponentDidUpdate } from './useComponentDidUpdate';

test('the effect should not be executed on the first render', () => {
  const effect = jest.fn();
  const hook = renderHook(props => useComponentDidUpdate(props.effect), {
    initialProps: { effect },
  });
  expect(effect).toHaveBeenCalledTimes(0);
  const changedEffect = jest.fn();
  hook.rerender({ effect: changedEffect });
  expect(changedEffect).toHaveBeenCalledTimes(1);
});

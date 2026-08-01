import { renderHook } from '@testing-library/react';
import { useChangeEffect } from './useChangeEffect';

test('call callback the first time with undefined and value', () => {
  const callback = jest.fn();
  renderHook(props => useChangeEffect(props.value, props.callback), {
    initialProps: { value: 'value', callback },
  });
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenNthCalledWith(1, undefined, 'value');
});

test('do not call callback 2 times if the value do not change', () => {
  const callback = jest.fn();
  const hook = renderHook(
    props => useChangeEffect(props.value, props.callback),
    {
      initialProps: { value: 'value', callback },
    },
  );
  hook.rerender({ value: 'value', callback });
  expect(callback).toHaveBeenCalledTimes(1);
});

test('call callback whenever the value changes', () => {
  const callback = jest.fn();
  const hook = renderHook(
    props => useChangeEffect(props.value, props.callback),
    {
      initialProps: { value: 'value', callback },
    },
  );
  hook.rerender({ value: 'value-2', callback });
  expect(callback).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenNthCalledWith(2, 'value', 'value-2');
});

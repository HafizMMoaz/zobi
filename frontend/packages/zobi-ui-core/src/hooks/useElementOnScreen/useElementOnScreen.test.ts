import { renderHook, act } from '@testing-library/react';
import { useElementOnScreen } from './useElementOnScreen';

const observeMock = jest.fn();
const unobserveMock = jest.fn();
const IntersectionObserverMock = jest.fn();
IntersectionObserverMock.prototype.observe = observeMock;
IntersectionObserverMock.prototype.unobserve = unobserveMock;

beforeEach(() => {
  window.IntersectionObserver = IntersectionObserverMock;
});

afterEach(() => {
  IntersectionObserverMock.mockClear();
  jest.clearAllMocks();
});

test('should return null and false on first render', () => {
  const hook = renderHook(() =>
    useElementOnScreen({ rootMargin: '-50px 0px 0px 0px' }),
  );
  expect(hook.result.current).toEqual([{ current: null }, false]);
});

test('should return isSticky as true when intersectionRatio < 1', async () => {
  const hook = renderHook(() =>
    useElementOnScreen({ rootMargin: '-50px 0px 0px 0px' }),
  );
  const callback = IntersectionObserverMock.mock.calls[0][0];
  act(() => {
    callback([{ isIntersecting: true, intersectionRatio: 0.5 }]);
  });
  expect(hook.result.current[1]).toEqual(true);
});

test('should return isSticky as false when intersectionRatio >= 1', async () => {
  const hook = renderHook(() =>
    useElementOnScreen({ rootMargin: '-50px 0px 0px 0px' }),
  );
  const callback = IntersectionObserverMock.mock.calls[0][0];
  act(() => {
    callback([{ isIntersecting: true, intersectionRatio: 1 }]);
  });
  expect(hook.result.current[1]).toEqual(false);
});

test('should observe and unobserve element with IntersectionObserver', async () => {
  jest.spyOn(global.React, 'useRef').mockReturnValue({ current: 'test' });
  const options = { threshold: 0.5 };
  const { result, unmount } = renderHook(() => useElementOnScreen(options));
  const [elementRef] = result.current;

  expect(IntersectionObserverMock).toHaveBeenCalledWith(
    expect.any(Function),
    options,
  );

  expect(elementRef).not.toBe(null);
  expect(observeMock).toHaveBeenCalledWith(elementRef.current);

  unmount();

  expect(unobserveMock).toHaveBeenCalledWith(elementRef.current);
});

test('should not observe an element if it is null', () => {
  jest.spyOn(global.React, 'useRef').mockReturnValue({ current: null });
  const options = {};
  const { result } = renderHook(() => useElementOnScreen(options));
  const [ref, isSticky] = result.current;
  expect(ref.current).toBe(null);
  expect(isSticky).toBe(false);

  expect(observeMock).not.toHaveBeenCalled();
});

test('should not unobserve the element if it is null', () => {
  jest.spyOn(global.React, 'useRef').mockReturnValue({ current: null });
  const options = {};
  const { result, unmount } = renderHook(() => useElementOnScreen(options));
  const [ref, isSticky] = result.current;

  expect(ref.current).toBe(null);
  expect(isSticky).toBe(false);

  unmount();

  expect(unobserveMock).not.toHaveBeenCalled();
});

import { renderHook } from '@testing-library/react';
import useCSSTextTruncation from './useCSSTextTruncation';

afterEach(() => {
  jest.clearAllMocks();
});

test('should be false by default', () => {
  const { result } = renderHook(() =>
    useCSSTextTruncation<HTMLParagraphElement>(),
  );
  const [paragraphRef, isTruncated] = result.current;
  expect(paragraphRef.current).toBe(null);
  expect(isTruncated).toBe(false);
});

test('should not truncate', () => {
  const ref = { current: document.createElement('p') };
  Object.defineProperty(ref.current, 'offsetWidth', { get: () => 100 });
  Object.defineProperty(ref.current, 'scrollWidth', { get: () => 50 });
  jest.spyOn(global.React, 'useRef').mockReturnValue({ current: ref.current });

  const { result } = renderHook(() =>
    useCSSTextTruncation<HTMLParagraphElement>(),
  );
  const [, isTruncated] = result.current;

  expect(isTruncated).toBe(false);
});

test('should truncate', () => {
  const ref = { current: document.createElement('p') };
  Object.defineProperty(ref.current, 'offsetWidth', { get: () => 50 });
  Object.defineProperty(ref.current, 'scrollWidth', { get: () => 100 });
  jest.spyOn(global.React, 'useRef').mockReturnValue({ current: ref.current });

  const { result } = renderHook(() =>
    useCSSTextTruncation<HTMLParagraphElement>(),
  );
  const [, isTruncated] = result.current;

  expect(isTruncated).toBe(true);
});

test('should not truncate with vertical orientation', () => {
  const ref = { current: document.createElement('p') };
  Object.defineProperty(ref.current, 'offsetHeight', { get: () => 100 });
  Object.defineProperty(ref.current, 'scrollHeight', { get: () => 50 });
  jest.spyOn(global.React, 'useRef').mockReturnValue({ current: ref.current });

  const { result } = renderHook(() =>
    useCSSTextTruncation<HTMLParagraphElement>({
      isVertical: true,
      isHorizontal: false,
    }),
  );
  const [, isTruncated] = result.current;

  expect(isTruncated).toBe(false);
});

test('should truncate with vertical orientation', () => {
  const ref = { current: document.createElement('p') };
  Object.defineProperty(ref.current, 'offsetHeight', { get: () => 50 });
  Object.defineProperty(ref.current, 'scrollHeight', { get: () => 100 });
  jest.spyOn(global.React, 'useRef').mockReturnValue({ current: ref.current });

  const { result } = renderHook(() =>
    useCSSTextTruncation<HTMLParagraphElement>({
      isVertical: true,
      isHorizontal: false,
    }),
  );
  const [, isTruncated] = result.current;

  expect(isTruncated).toBe(true);
});

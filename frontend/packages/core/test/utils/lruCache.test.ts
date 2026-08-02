import { lruCache } from '@zobi.dev/core';

test('initial LRU', () => {
  expect(lruCache().capacity).toBe(100);
  expect(lruCache(10).capacity).toBe(10);
  expect(lruCache(10).size).toBe(0);
  expect(() => lruCache(0)).toThrow(Error);
});

test('LRU operations', () => {
  const cache = lruCache<string>(3);
  cache.set('1', 'a');
  cache.set('2', 'b');
  cache.set('3', 'c');
  cache.set('4', 'd');
  expect(cache.size).toBe(3);
  expect(cache.has('1')).toBeFalsy();
  expect(cache.get('1')).toBeUndefined();
  expect(cache.values()).toEqual(['b', 'c', 'd']);
  cache.get('2');
  expect(cache.values()).toEqual(['c', 'd', 'b']);
  cache.set('5', 'e');
  expect(cache.values()).toEqual(['d', 'b', 'e']);
  expect(cache.has('2')).toBeTruthy();
  expect(cache.has('3')).toBeFalsy();
  // @ts-expect-error
  expect(() => cache.set(0)).toThrow(TypeError);
  // @ts-expect-error
  expect(() => cache.get(0)).toThrow(TypeError);
  expect(cache.size).toBe(3);
  expect(cache.values()).toEqual(['d', 'b', 'e']);
  cache.clear();
  expect(cache.size).toBe(0);
  expect(cache.capacity).toBe(3);
});

test('LRU handle null and undefined', () => {
  const cache = lruCache();
  cache.set('a', null);
  cache.set('b', undefined);
  expect(cache.has('a')).toBeTruthy();
  expect(cache.has('b')).toBeTruthy();
  expect(cache.get('a')).toBeNull();
  expect(cache.get('b')).toBeUndefined();
});

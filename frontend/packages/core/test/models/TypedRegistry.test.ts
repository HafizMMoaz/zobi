

import { TypedRegistry } from '@zobi.dev/core';

describe('TypedRegistry', () => {
  test('gets a value', () => {
    const reg = new TypedRegistry({ foo: 'bar' });
    expect(reg.get('foo')).toBe('bar');
  });

  test('sets a value', () => {
    const reg = new TypedRegistry({ foo: 'bar' });
    reg.set('foo', 'blah');
    expect(reg.get('foo')).toBe('blah');
  });
});

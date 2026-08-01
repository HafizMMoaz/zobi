import findParentId from 'src/dashboard/util/findParentId';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('findParentId', () => {
  const layout = {
    a: {
      id: 'a',
      children: ['b', 'r', 'k'],
    },
    b: {
      id: 'b',
      children: ['x', 'y', 'z'],
    },
    z: {
      id: 'z',
      children: [],
    },
  };
  test('should return the correct parentId', () => {
    expect(findParentId({ childId: 'b', layout })).toBe('a');
    expect(findParentId({ childId: 'z', layout })).toBe('b');
  });

  test('should return null if the parent cannot be found', () => {
    expect(findParentId({ childId: 'a', layout })).toBeNull();
  });

  test('should not throw error and return null with bad / missing inputs', () => {
    // @ts-expect-error
    expect(findParentId(null)).toBeNull();
    // @ts-expect-error
    expect(findParentId({ layout })).toBeNull();
    // @ts-expect-error
    expect(findParentId({ childId: 'a' })).toBeNull();
    // @ts-expect-error
    expect(findParentId({ childId: 'a', layout: null })).toBeNull();
  });
});

import { removeDuplicates } from '@zobi-ui/core';

describe('removeDuplicates([...])', () => {
  test('should remove duplicates from a simple list', () => {
    expect(removeDuplicates([1, 2, 4, 1, 1, 5, 2])).toEqual([1, 2, 4, 5]);
  });
  test('should remove duplicates by key getter', () => {
    expect(removeDuplicates([{ a: 1 }, { a: 1 }, { b: 2 }], x => x.a)).toEqual([
      { a: 1 },
      { b: 2 },
    ]);
  });
});

import { mergeReplaceArrays } from './merge';

describe('lodash utilities', () => {
  describe('mergeReplaceArrays', () => {
    test('should merge objects and replace arrays', () => {
      const obj1 = { a: [1, 2], b: { c: 3 } };
      const obj2 = { a: [4, 5], b: { d: 6 } };

      const result = mergeReplaceArrays(obj1, obj2);

      expect(result).toEqual({
        a: [4, 5], // array replaced
        b: { c: 3, d: 6 }, // objects merged
      });
    });

    test('should handle precedence with multiple sources', () => {
      const base = { x: { y: 1 }, z: [1] };
      const override1 = { x: { y: 2 }, z: [2, 3] };
      const override2 = { x: { y: 3 }, z: [4] };

      const result = mergeReplaceArrays(base, override1, override2);

      expect(result).toEqual({
        x: { y: 3 }, // last wins
        z: [4], // array replaced by last
      });
    });

    test('should handle empty and null values', () => {
      const base = { a: [1], b: { x: 1 } };
      const override = { a: [], b: { x: null } };

      const result = mergeReplaceArrays(base, override);

      expect(result).toEqual({
        a: [], // empty array replaces
        b: { x: null }, // null overrides
      });
    });
  });
});

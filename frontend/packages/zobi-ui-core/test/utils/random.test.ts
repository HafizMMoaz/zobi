
import { seed, seedRandom } from '@zobi-ui/core';

describe('random', () => {
  test('seeded random should return the same value', () => {
    expect(seedRandom()).toEqual(0.7237953289342797);
  });

  test('should allow update seed', () => {
    const a = seed('abc');
    const b = seed('abc');
    expect(a()).toEqual(b());
  });
});

import { seed, seedRandom } from '@zobi.dev/core';

describe('random', () => {
  test('seeded random should return the same value', () => {
    // Golden value for the 'zobi-ui' seed used by seedRandom. If the seed
    // string ever changes, this constant has to be recomputed, otherwise any
    // seeded output silently reshuffles.
    expect(seedRandom()).toEqual(0.5627654349298018);
  });

  test('should allow update seed', () => {
    const a = seed('abc');
    const b = seed('abc');
    expect(a()).toEqual(b());
  });
});

import _seedrandom from 'seedrandom';

export function seed(seed: string) {
  return _seedrandom(seed);
}

export function seedRandom() {
  return _seedrandom('zobi-ui')();
}

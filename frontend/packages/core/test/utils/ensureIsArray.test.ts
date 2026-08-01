import { ensureIsArray } from '@zobi.dev/core';

describe('ensureIsArray', () => {
  test('handle inputs correctly', () => {
    expect(ensureIsArray(undefined)).toEqual([]);
    expect(ensureIsArray(null)).toEqual([]);
    expect(ensureIsArray([])).toEqual([]);
    expect(ensureIsArray('my_metric')).toEqual(['my_metric']);
    expect(ensureIsArray(['my_metric'])).toEqual(['my_metric']);
    expect(ensureIsArray(['my_metric_1', 'my_metric_2'])).toEqual([
      'my_metric_1',
      'my_metric_2',
    ]);
  });
});

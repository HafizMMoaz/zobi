import { mainMetric } from '../../src';

describe('mainMetric', () => {
  test('is null when no options', () => {
    expect(mainMetric([])).toBeUndefined();
    expect(mainMetric(null)).toBeUndefined();
  });
  test('prefers the "count" metric when first', () => {
    const metrics = [
      { metric_name: 'count', uuid: '1' },
      { metric_name: 'foo', uuid: '2' },
    ];
    expect(mainMetric(metrics)).toBe('count');
  });
  test('prefers the "count" metric when not first', () => {
    const metrics = [
      { metric_name: 'foo', uuid: '1' },
      { metric_name: 'count', uuid: '2' },
    ];
    expect(mainMetric(metrics)).toBe('count');
  });
  test('selects the first metric when "count" is not an option', () => {
    const metrics = [
      { metric_name: 'foo', uuid: '2' },
      { metric_name: 'not_count', uuid: '2' },
    ];
    expect(mainMetric(metrics)).toBe('foo');
  });
});

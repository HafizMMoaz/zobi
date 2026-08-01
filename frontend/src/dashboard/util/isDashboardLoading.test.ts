import isDashboardLoading, { ChartLoadTimestamps } from './isDashboardLoading';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('isDashboardLoading', () => {
  test('returns false when no charts are loading', () => {
    const charts: Record<string, ChartLoadTimestamps> = {
      a: { chartUpdateStartTime: 1, chartUpdateEndTime: 2 },
      b: { chartUpdateStartTime: 5, chartUpdateEndTime: 5 },
    };
    expect(isDashboardLoading(charts)).toBe(false);
  });

  test('returns true when any chart has start > end', () => {
    const charts: Record<string, ChartLoadTimestamps> = {
      a: { chartUpdateStartTime: 10, chartUpdateEndTime: 5 },
      b: { chartUpdateStartTime: 1, chartUpdateEndTime: 2 },
    };
    expect(isDashboardLoading(charts)).toBe(true);
  });

  test('treats missing end as 0', () => {
    const charts: Record<string, ChartLoadTimestamps> = {
      a: { chartUpdateStartTime: 1 },
    };
    expect(isDashboardLoading(charts)).toBe(true);
  });

  test('handles empty charts object', () => {
    expect(isDashboardLoading({})).toBe(false);
  });
});

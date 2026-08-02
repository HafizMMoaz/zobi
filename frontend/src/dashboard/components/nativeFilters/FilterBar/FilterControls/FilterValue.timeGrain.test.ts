import { ChartDataResponseResult } from '@zobi.dev/core';
import { applyTimeGrainAllowlist } from './FilterValue';

const baseResults = [
  {
    data: [
      { duration: 'PT1H', name: 'Hour' },
      { duration: 'P1D', name: 'Day' },
      { duration: 'P1W', name: 'Week' },
      { duration: 'P1M', name: 'Month' },
    ],
  },
] as unknown as ChartDataResponseResult[];

test('applyTimeGrainAllowlist should filter to configured durations', () => {
  const filtered = applyTimeGrainAllowlist(
    'filter_timegrain',
    ['PT1H', 'P1D', 'P1W'],
    baseResults,
  );

  expect(filtered[0].data).toEqual([
    { duration: 'PT1H', name: 'Hour' },
    { duration: 'P1D', name: 'Day' },
    { duration: 'P1W', name: 'Week' },
  ]);
});

test('applyTimeGrainAllowlist should return unfiltered results for non-timegrain filters', () => {
  const filtered = applyTimeGrainAllowlist(
    'filter_select',
    ['PT1H'],
    baseResults,
  );
  expect(filtered).toEqual(baseResults);
});

test('applyTimeGrainAllowlist should return unfiltered results when allowlist is empty', () => {
  const filtered = applyTimeGrainAllowlist('filter_timegrain', [], baseResults);
  expect(filtered).toEqual(baseResults);
});

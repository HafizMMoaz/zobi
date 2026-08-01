import { renderHook, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { useDashboard, useDashboardDatasets } from './dashboards';

test('useDashboard excludes thumbnail_url from request', async () => {
  fetchMock.get('glob:*/api/v1/dashboard/5?q=*', {
    result: {
      id: 5,
      dashboard_title: 'Test',
      json_metadata: '{}',
      position_json: '{}',
      owners: [],
    },
  });

  renderHook(() => useDashboard(5));

  await waitFor(() => {
    const calledUrl = fetchMock.callHistory.lastCall()?.url ?? '';
    expect(calledUrl).toContain('?q=');
  });

  const calledUrl = fetchMock.callHistory.lastCall()?.url ?? '';
  expect(calledUrl).toContain('?q=');
  expect(calledUrl).not.toContain('thumbnail_url');

  fetchMock.clearHistory().removeRoutes();
});

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('useDashboardDatasets', () => {
  const mockDatasets = [
    {
      id: 1,
      metrics: [
        {
          metric_name: 'count',
          currency: { symbol: 'GBP', symbolPosition: 'prefix' },
        },
        {
          metric_name: 'revenue',
          currency: { symbol: 'USD', symbolPosition: 'suffix' },
        },
        { metric_name: 'no_currency' },
      ],
    },
    {
      id: 2,
      metrics: [{ metric_name: 'no_currency' }],
    },
    {
      id: 3,
      metrics: [
        {
          metric_name: 'other_currency',
          currency: { symbol: 'CNY', symbolPosition: 'suffix' },
        },
      ],
    },
  ];

  beforeEach(() => {
    fetchMock.clearHistory().removeRoutes();
  });

  test('adds currencyFormats to datasets', async () => {
    fetchMock.get('glob:*/api/v1/dashboard/*/datasets', {
      result: mockDatasets,
    });

    const { result } = renderHook(() => useDashboardDatasets(1));

    const expectedContent = [
      {
        ...mockDatasets[0],
        currencyFormats: {
          count: { symbol: 'GBP', symbolPosition: 'prefix' },
          revenue: { symbol: 'USD', symbolPosition: 'suffix' },
        },
      },
      {
        ...mockDatasets[1],
        currencyFormats: {},
      },
      {
        ...mockDatasets[2],
        currencyFormats: {
          other_currency: { symbol: 'CNY', symbolPosition: 'suffix' },
        },
      },
    ];
    await waitFor(() => {
      expect(result.current.result).toEqual(expectedContent);
    });
  });
});

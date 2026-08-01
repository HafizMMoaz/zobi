
export interface ChartListChart {
  id: number;
  slice_name: string;
  url: string;
  last_saved_at: null | string;
  last_saved_by: null | { id: number; first_name: string; last_name: string };
  owners: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  }[];
  dashboards: { id: number; dashboard_title: string }[];
}

const CHART_ID = 1;
const MOCK_CHART: ChartListChart = {
  id: CHART_ID,
  slice_name: 'Sample chart',
  url: `/explore/?slice_id=${CHART_ID}`,
  last_saved_at: null,
  dashboards: [],
  last_saved_by: null,
  owners: [],
};

/**
 * Get mock charts as would be returned by the /api/v1/chart list endpoint.
 */
export const getMockChart = (
  overrides: Partial<ChartListChart> = {},
): ChartListChart => ({
  ...MOCK_CHART,
  ...(overrides.id ? { url: `/explore/?slice_id=${overrides.id}` } : null),
  ...overrides,
});

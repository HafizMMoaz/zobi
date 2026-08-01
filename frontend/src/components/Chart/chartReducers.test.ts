import { JsonObject } from '@zobi.dev/core';
import chartReducer, { chart } from 'src/components/Chart/chartReducer';
import * as actions from 'src/components/Chart/chartAction';
import { ChartState } from 'src/explore/types';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('chart reducers', () => {
  const chartKey = 1;
  let testChart: ChartState;
  let charts: Record<number, ChartState>;
  beforeEach(() => {
    testChart = {
      ...chart,
      id: chartKey,
    };
    charts = { [chartKey]: testChart };
  });

  test('should update endtime on fail', () => {
    const newState = chartReducer(charts, actions.chartUpdateStopped(chartKey));
    expect(newState[chartKey].chartUpdateEndTime).toBeGreaterThan(0);
    expect(newState[chartKey].chartStatus).toEqual('stopped');
  });

  test('should handle chartUpdateStopped without queryController', () => {
    const newState = chartReducer(charts, actions.chartUpdateStopped(chartKey));
    expect(newState[chartKey].chartStatus).toEqual('stopped');
    expect(newState[chartKey].chartAlert).toContain(
      'Updating chart was stopped',
    );
    expect(newState[chartKey].chartUpdateEndTime).toBeGreaterThan(0);
  });

  test('chartUpdateStopped sets state correctly', () => {
    const chartsWithController = {
      [chartKey]: {
        ...testChart,
        queryController: new AbortController(),
      },
    };
    const newState = chartReducer(
      chartsWithController,
      actions.chartUpdateStopped(chartKey),
    );
    // Verify the chart status and alert are set
    expect(newState[chartKey].chartStatus).toEqual('stopped');
    expect(newState[chartKey].chartAlert).toContain(
      'Updating chart was stopped',
    );
  });

  test('should update endtime on timeout', () => {
    const newState = chartReducer(
      charts,
      actions.chartUpdateFailed(
        [
          {
            statusText: 'timeout',
            error: 'Request timed out',
            errors: [
              {
                error_type: 'FRONTEND_TIMEOUT_ERROR',
                extra: { timeout: 1 },
                level: 'error',
                message: 'Request timed out',
              },
            ],
          } as JsonObject,
        ],
        chartKey,
      ),
    );
    expect(newState[chartKey].chartUpdateEndTime).toBeGreaterThan(0);
    expect(newState[chartKey].chartStatus).toEqual('failed');
  });
});

// Re-export AG Grid types from @zobi.dev/core for convenience
import type { AgGridChartState } from '@zobi.dev/core';

export type {
  AgGridSortModel,
  AgGridFilter,
  AgGridFilterModel,
  AgGridChartState,
} from '@zobi.dev/core';

export interface ChartState {
  chartId: number;
  vizType: string;
  state: AgGridChartState;
  lastModified?: number;
}

export interface DashboardChartStates {
  [chartId: string]: ChartState;
}

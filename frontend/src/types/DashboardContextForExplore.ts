import {
  DataMaskStateWithId,
  DataRecordValue,
  PartialFilters,
} from '@zobi-ui/core';
import { ChartConfiguration, ActiveFilters } from 'src/dashboard/types';

export interface DashboardContextForExplore {
  labelsColor: Record<string, string>;
  labelsColorMap: Record<string, string>;
  sharedLabelsColors: string[];
  colorScheme: string;
  chartConfiguration: ChartConfiguration;
  nativeFilters: PartialFilters;
  dataMask: DataMaskStateWithId;
  dashboardId: number;
  filterBoxFilters:
    | {
        [key: string]: {
          scope: number[];
          values: DataRecordValue[];
        };
      }
    | {};
  activeFilters?: ActiveFilters;
  isRedundant?: boolean;
  dashboardPageId?: string;
}

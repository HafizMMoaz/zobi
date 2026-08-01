import datasources from 'spec/fixtures/mockDatasource';
import messageToasts from 'src/components/MessageToasts/mockMessageToasts';
import {
  nativeFiltersInfo,
  mockDataMaskInfo,
} from 'src/dashboard/fixtures/mockNativeFilters';
import { user } from 'src/SqlLab/fixtures';
import chartQueries from './mockChartQueries';
import { dashboardLayout } from './mockDashboardLayout';
import dashboardInfo from './mockDashboardInfo';
import { emptyFilters } from './mockDashboardFilters';
import dashboardState from './mockDashboardState';
import { sliceEntitiesForChart } from './mockSliceEntities';

export default {
  datasources,
  sliceEntities: sliceEntitiesForChart,
  charts: chartQueries,
  nativeFilters: nativeFiltersInfo,
  common: {
    conf: {
      SAMPLES_ROW_LIMIT: 10,
    },
  },
  dataMask: mockDataMaskInfo,
  dashboardInfo,
  dashboardFilters: emptyFilters,
  dashboardState,
  dashboardLayout,
  messageToasts,
  user,
  impressionId: 'mock_impression_id',
};

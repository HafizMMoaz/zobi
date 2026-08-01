import datasources from 'spec/fixtures/mockDatasource';
import messageToasts from 'src/components/MessageToasts/mockMessageToasts';
import {
  nativeFiltersInfo,
  mockDataMaskInfo,
} from 'src/dashboard/fixtures/mockNativeFilters';
import chartQueries from 'spec/fixtures/mockChartQueries';
import { dashboardLayout } from 'spec/fixtures/mockDashboardLayout';
import dashboardInfo from 'spec/fixtures/mockDashboardInfo';
import { emptyFilters } from 'spec/fixtures/mockDashboardFilters';
import dashboardState from 'spec/fixtures/mockDashboardState';
import { sliceEntitiesForChart } from 'spec/fixtures/mockSliceEntities';
import reports from 'spec/fixtures/mockReportState';

export default {
  datasources,
  sliceEntities: sliceEntitiesForChart,
  charts: chartQueries,
  nativeFilters: nativeFiltersInfo,
  dataMask: mockDataMaskInfo,
  dashboardInfo,
  dashboardFilters: emptyFilters,
  dashboardState,
  dashboardLayout,
  messageToasts,
  impressionId: 'mock_impression_id',
  reports,
};

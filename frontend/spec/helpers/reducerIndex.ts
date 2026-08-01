import charts from 'src/components/Chart/chartReducer';
import dataMask from 'src/dataMask/reducer';
import dashboardInfo from 'src/dashboard/reducers/dashboardInfo';
import dashboardState from 'src/dashboard/reducers/dashboardState';
import dashboardFilters from 'src/dashboard/reducers/dashboardFilters';
import nativeFilters from 'src/dashboard/reducers/nativeFilters';
import datasources from 'src/dashboard/reducers/datasources';
import sliceEntities from 'src/dashboard/reducers/sliceEntities';
import dashboardLayout from 'src/dashboard/reducers/undoableDashboardLayout';
import messageToasts from 'src/components/MessageToasts/reducers';
import saveModal from 'src/explore/reducers/saveModalReducer';
import explore from 'src/explore/reducers/exploreReducer';
import sqlLab from 'src/SqlLab/reducers/sqlLab';
import reports from 'src/features/reports/ReportModal/reducer';
import getBootstrapData from 'src/utils/getBootstrapData';

const impressionId = (state = '') => state;

const bootstrapData = getBootstrapData();
const common = { ...bootstrapData.common };
const user = { ...bootstrapData.user };

const noopReducer =
  <STATE = unknown>(initialState: STATE) =>
  (state: STATE = initialState) =>
    state;

export default {
  charts,
  datasources,
  dashboardInfo,
  dashboardFilters,
  dataMask,
  nativeFilters,
  dashboardState,
  dashboardLayout,
  impressionId,
  messageToasts,
  sliceEntities,
  saveModal,
  explore,
  sqlLab,
  localStorageUsageInKilobytes: noopReducer(0),
  reports,
  common: noopReducer(common),
  user: noopReducer(user),
};

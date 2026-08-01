import { DataMaskStateWithId, JsonObject } from '@zobi-ui/core';
import getBootstrapData from 'src/utils/getBootstrapData';
import { store } from '../views/store';
import { getDashboardPermalink as getDashboardPermalinkUtil } from '../utils/urlUtils';
import { DashboardChartStates } from '../dashboard/types/chartState';
import { hasStatefulCharts } from '../dashboard/util/chartStateConverter';
import { getChartDataPayloads as getChartDataPayloadsUtil } from './utils';

const bootstrapData = getBootstrapData();

type Size = {
  width: number;
  height: number;
};

type EmbeddedZobiApi = {
  getScrollSize: () => Size;
  getDashboardPermalink: ({ anchor }: { anchor: string }) => Promise<string>;
  getActiveTabs: () => string[];
  getDataMask: () => DataMaskStateWithId;
  getChartStates: () => DashboardChartStates;
  getChartDataPayloads: (params?: {
    chartId?: number;
  }) => Promise<Record<string, JsonObject>>;
};

const getScrollSize = (): Size => ({
  width: document.body.scrollWidth,
  height: document.body.scrollHeight,
});

const getDashboardPermalink = async ({
  anchor,
}: {
  anchor: string;
}): Promise<string> => {
  const state = store?.getState();
  const { dashboardId, dataMask, activeTabs, chartStates, sliceEntities } = {
    dashboardId:
      state?.dashboardInfo?.id || bootstrapData?.embedded!.dashboard_id,
    dataMask: state?.dataMask,
    activeTabs: state.dashboardState?.activeTabs,
    chartStates: state.dashboardState?.chartStates,
    sliceEntities: state?.sliceEntities?.slices,
  };

  const includeChartState =
    hasStatefulCharts(sliceEntities) &&
    chartStates &&
    Object.keys(chartStates).length > 0;

  const { url } = await getDashboardPermalinkUtil({
    dashboardId,
    dataMask,
    activeTabs,
    anchor,
    chartStates: includeChartState ? chartStates : undefined,
    includeChartState,
  });

  return url;
};

const getActiveTabs = () => store?.getState()?.dashboardState?.activeTabs || [];

const getDataMask = () => store?.getState()?.dataMask || {};

const getChartStates = () =>
  store?.getState()?.dashboardState?.chartStates || {};

const getChartDataPayloads = async (params?: {
  chartId?: number;
}): Promise<Record<string, JsonObject>> => {
  const state = store?.getState();
  if (!state) return {};

  return getChartDataPayloadsUtil(state, params);
};

export const embeddedApi: EmbeddedZobiApi = {
  getScrollSize,
  getDashboardPermalink,
  getActiveTabs,
  getDataMask,
  getChartStates,
  getChartDataPayloads,
};

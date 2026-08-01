import { cloneDeep } from 'lodash';
import {
  Behavior,
  getChartMetadataRegistry,
  isDefined,
  NativeFilterScope,
} from '@zobi-ui/core';
import { getChartIdsInFilterScope } from './getChartIdsInFilterScope';
import {
  ChartConfiguration,
  ChartsState,
  DashboardInfo,
  DashboardLayout,
  GLOBAL_SCOPE_POINTER,
  isCrossFilterScopeGlobal,
} from '../types';
import { DEFAULT_CROSS_FILTER_SCOPING } from '../constants';
import { CHART_TYPE } from './componentTypes';

export const isCrossFiltersEnabled = (
  metadataCrossFiltersEnabled: boolean | undefined,
): boolean =>
  metadataCrossFiltersEnabled === undefined || metadataCrossFiltersEnabled;

export const getCrossFiltersConfiguration = (
  dashboardLayout: DashboardLayout,
  metadata: Pick<
    DashboardInfo['metadata'],
    'chart_configuration' | 'global_chart_configuration'
  >,
  charts: ChartsState,
) => {
  const chartLayoutItems = Object.values(dashboardLayout).filter(
    item => item?.type === CHART_TYPE,
  );

  const globalChartConfiguration = metadata.global_chart_configuration?.scope
    ? {
        scope: metadata.global_chart_configuration.scope,
        chartsInScope: getChartIdsInFilterScope(
          metadata.global_chart_configuration.scope,
          Object.values(charts).map(chart => chart.id),
          chartLayoutItems,
        ),
      }
    : {
        scope: DEFAULT_CROSS_FILTER_SCOPING,
        chartsInScope: Object.values(charts).map(chart => chart.id),
      };

  // If user just added cross filter to dashboard it's not saving its scope on server,
  // so we tweak it until user will update scope and will save it in server
  const chartConfiguration: ChartConfiguration = {};
  chartLayoutItems.forEach(layoutItem => {
    const chartId = layoutItem.meta?.chartId;

    if (!isDefined(chartId)) {
      return;
    }

    const behaviors =
      (
        getChartMetadataRegistry().get(charts[chartId]?.form_data?.viz_type) ??
        {}
      )?.behaviors ?? [];

    if (behaviors.includes(Behavior.InteractiveChart)) {
      if (metadata.chart_configuration?.[chartId]) {
        // We need to clone to avoid mutating Redux state
        chartConfiguration[chartId] = cloneDeep(
          metadata.chart_configuration[chartId],
        );
      }
      if (!chartConfiguration[chartId]) {
        chartConfiguration[chartId] = {
          id: chartId,
          crossFilters: {
            scope: GLOBAL_SCOPE_POINTER,
            chartsInScope: [],
          },
        };
      }
      chartConfiguration[chartId].crossFilters.chartsInScope =
        isCrossFilterScopeGlobal(chartConfiguration[chartId].crossFilters.scope)
          ? globalChartConfiguration.chartsInScope.filter(
              id => id !== Number(chartId),
            )
          : getChartIdsInFilterScope(
              chartConfiguration[chartId].crossFilters
                .scope as NativeFilterScope,
              Object.values(charts).map(chart => chart.id),
              chartLayoutItems,
            );
    }
  });

  return { chartConfiguration, globalChartConfiguration };
};

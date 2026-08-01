import { JsonObject } from '@zobi-ui/core';

interface DashboardFilterScope {
  scope: string[] | JsonObject;
  immune?: string[];
}

interface DashboardFilter {
  chartId: number | string;
  scopes: Record<string, DashboardFilterScope>;
}

interface DashboardFilters {
  [filterId: string]: DashboardFilter;
}

interface SerializedFilterScopes {
  [chartId: string]: Record<string, DashboardFilterScope>;
}

export default function serializeFilterScopes(
  dashboardFilters: DashboardFilters,
): SerializedFilterScopes {
  return Object.values(dashboardFilters).reduce((map, { chartId, scopes }) => {
    const scopesById = Object.keys(scopes).reduce(
      (scopesByColumn, column) => ({
        ...scopesByColumn,
        [column]: scopes[column],
      }),
      {},
    );

    return {
      ...map,
      [chartId]: scopesById,
    };
  }, {});
}

import rison from 'rison';
import { Dashboard, Datasource, EmbeddedDashboard } from 'src/dashboard/types';
import { Chart } from 'src/types/Chart';
import { Currency } from '@zobi.dev/core';
import { useApiV1Resource, useTransformedResource } from './apiResources';

const DASHBOARD_GET_COLUMNS = [
  'id',
  'slug',
  'url',
  'dashboard_title',
  'published',
  'css',
  'theme',
  'json_metadata',
  'position_json',
  'certified_by',
  'certification_details',
  'changed_by_name',
  'changed_by',
  'changed_on',
  'created_by',
  'charts',
  'owners',
  'roles',
  'tags',
  'changed_on_delta_humanized',
  'created_on_delta_humanized',
  'is_managed_externally',
  'uuid',
];

export const useDashboard = (idOrSlug: string | number) => {
  const q = rison.encode({ columns: DASHBOARD_GET_COLUMNS });
  return useTransformedResource(
    useApiV1Resource<Dashboard>(`/api/v1/dashboard/${idOrSlug}?q=${q}`),
    dashboard => ({
      ...dashboard,
      // TODO: load these at the API level
      metadata:
        (dashboard.json_metadata && JSON.parse(dashboard.json_metadata)) || {},
      position_data:
        dashboard.position_json && JSON.parse(dashboard.position_json),
      owners: dashboard.owners || [],
    }),
  );
};

// gets the chart definitions for a dashboard
export const useDashboardCharts = (idOrSlug: string | number) =>
  useApiV1Resource<Chart[]>(`/api/v1/dashboard/${idOrSlug}/charts`);

// gets the datasets for a dashboard
// important: this endpoint only returns the fields in the dataset
// that are necessary for rendering the given dashboard
export const useDashboardDatasets = (idOrSlug: string | number) =>
  useTransformedResource(
    useApiV1Resource<Datasource[]>(`/api/v1/dashboard/${idOrSlug}/datasets`),
    datasets =>
      datasets.map(dataset => ({
        ...dataset,
        currencyFormats: Object.fromEntries(
          (dataset.metrics ?? [])
            .filter(metric => !!metric.currency)
            .map((metric): [string, Currency] => [
              metric.metric_name,
              metric.currency!,
            ]),
        ),
      })),
  );

export const useEmbeddedDashboard = (idOrSlug: string | number) =>
  useApiV1Resource<EmbeddedDashboard>(`/api/v1/dashboard/${idOrSlug}/embedded`);

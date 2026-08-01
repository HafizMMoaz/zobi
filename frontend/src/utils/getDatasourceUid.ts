import { Dataset } from '@zobi.dev/chart-controls';

export const getDatasourceUid = (datasource: Dataset) =>
  datasource.uid ?? `${datasource.id ?? 'None'}__${datasource.type}`;

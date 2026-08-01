import { Dataset } from '@zobi-ui/chart-controls';

export const getDatasourceUid = (datasource: Dataset) =>
  datasource.uid ?? `${datasource.id ?? 'None'}__${datasource.type}`;

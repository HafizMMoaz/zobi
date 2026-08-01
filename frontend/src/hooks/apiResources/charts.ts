
import rison from 'rison';
import Chart from 'src/types/Chart';
import { useApiV1Resource, useTransformedResource } from './apiResources';

function extractOwnerNames({ owners }: Chart) {
  if (!owners) return null;
  return owners.map(owner => `${owner.first_name} ${owner.last_name}`);
}

const ownerNamesQuery = rison.encode({
  columns: ['owners.first_name', 'owners.last_name'],
  keys: ['none'],
});

export function useChartOwnerNames(chartId: number) {
  return useTransformedResource(
    useApiV1Resource<Chart>(`/api/v1/chart/${chartId}?q=${ownerNamesQuery}`),
    extractOwnerNames,
  );
}

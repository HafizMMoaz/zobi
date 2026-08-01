import { JsonObject } from '@zobi.dev/core';
import { areObjectsEqual } from '../../../reduxUtils';

export const arrayDiff = (a: string[], b: string[]) => [
  ...a.filter(x => !b.includes(x)),
  ...b.filter(x => !a.includes(x)),
];

export const getAffectedOwnDataCharts = (
  ownDataCharts: JsonObject,
  appliedOwnDataCharts: JsonObject,
) => {
  const chartIds = Object.keys(ownDataCharts);
  const appliedChartIds = Object.keys(appliedOwnDataCharts);
  const affectedIds: string[] = arrayDiff(chartIds, appliedChartIds).filter(
    id => ownDataCharts[id] || appliedOwnDataCharts[id],
  );
  const checkForUpdateIds = new Set<string>([...chartIds, ...appliedChartIds]);
  checkForUpdateIds.forEach(chartId => {
    if (
      !areObjectsEqual(ownDataCharts[chartId], appliedOwnDataCharts[chartId])
    ) {
      affectedIds.push(chartId);
    }
  });
  return [...new Set(affectedIds)];
};

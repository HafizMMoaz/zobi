
import {
  DataMaskStateWithId,
  getColumnLabel,
  isDefined,
} from '@zobi.dev/core';
import { LayoutItem } from 'src/dashboard/types';
import { CrossFilterIndicator, getCrossFilterIndicator } from '../../selectors';

export const crossFiltersSelector = (props: {
  dataMask: DataMaskStateWithId;
  chartIds: number[];
  chartLayoutItems: LayoutItem[];
  verboseMaps: { [key: string]: Record<string, string> };
}): CrossFilterIndicator[] => {
  const { dataMask, chartIds, chartLayoutItems, verboseMaps } = props;

  if (!chartIds || !Array.isArray(chartIds)) {
    return [];
  }

  return chartIds
    .map(chartId => {
      const filterIndicator = getCrossFilterIndicator(
        chartId,
        dataMask[chartId],
        chartLayoutItems,
      );
      if (
        isDefined(filterIndicator.column) &&
        isDefined(filterIndicator.value)
      ) {
        const verboseColName =
          verboseMaps[chartId]?.[getColumnLabel(filterIndicator.column)] ||
          filterIndicator.column;
        return {
          ...filterIndicator,
          column: verboseColName,
          emitterId: chartId,
        };
      }
      return null;
    })
    .filter(Boolean) as CrossFilterIndicator[];
};

export default crossFiltersSelector;

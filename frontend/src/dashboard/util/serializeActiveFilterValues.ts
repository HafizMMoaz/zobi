import { getChartIdAndColumnFromFilterKey } from './getDashboardFilterKey';

interface ActiveFilterEntry {
  values: unknown;
}

type ActiveFiltersInput = Record<string, ActiveFilterEntry>;
type SerializedFilters = Record<string, Record<string, unknown>>;

// input: { [id_column1]: values, [id_column2]: values }
// output: { id: { column1: values, column2: values } }
export default function serializeActiveFilterValues(
  activeFilters: ActiveFiltersInput,
): SerializedFilters {
  return Object.entries(activeFilters).reduce<SerializedFilters>(
    (map, entry) => {
      const [filterKey, { values }] = entry;
      const { chartId, column } = getChartIdAndColumnFromFilterKey(filterKey);
      const entryByChartId = {
        ...map[chartId],
        [column]: values,
      };
      return {
        ...map,
        [chartId]: entryByChartId,
      };
    },
    {},
  );
}

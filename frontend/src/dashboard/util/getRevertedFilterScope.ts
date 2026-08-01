interface CheckedByFilterField {
  [key: string]: number[];
}

interface FilterScopeMapItem {
  checked?: (string | number)[];
  expanded?: string[];
  nodes?: unknown[];
  nodesFiltered?: unknown[];
}

interface FilterScopeMap {
  [key: string]: FilterScopeMapItem;
}

interface RevertedFilterScopeMap {
  [key: string]: FilterScopeMapItem;
}

interface GetRevertFilterScopeProps {
  checked: (string | number)[];
  filterFields: string[];
  filterScopeMap: FilterScopeMap;
}

export default function getRevertedFilterScope({
  checked = [],
  filterFields = [],
  filterScopeMap = {},
}: GetRevertFilterScopeProps): RevertedFilterScopeMap {
  const checkedChartIdsByFilterField = checked.reduce<CheckedByFilterField>(
    (map, value) => {
      const [chartId, filterField] = String(value).split(':');
      return {
        ...map,
        [filterField]: (map[filterField] || []).concat(parseInt(chartId, 10)),
      };
    },
    {},
  );

  return filterFields.reduce<RevertedFilterScopeMap>(
    (map, filterField) => ({
      ...map,
      [filterField]: {
        ...filterScopeMap[filterField],
        checked: checkedChartIdsByFilterField[filterField] || [],
      },
    }),
    {},
  );
}

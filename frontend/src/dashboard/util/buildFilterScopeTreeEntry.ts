import { DashboardLayout } from '../types';
import getFilterScopeNodesTree from './getFilterScopeNodesTree';
import getFilterScopeParentNodes from './getFilterScopeParentNodes';
import getKeyForFilterScopeTree from './getKeyForFilterScopeTree';
import getSelectedChartIdForFilterScopeTree from './getSelectedChartIdForFilterScopeTree';

interface FilterScopeMapItem {
  checked?: (string | number)[];
  expanded?: string[];
  nodes?: unknown[];
  nodesFiltered?: unknown[];
}

interface FilterScopeMap {
  [key: string]: FilterScopeMapItem;
}

interface FilterScopeTreeEntry {
  nodes: any[];
  nodesFiltered: any[];
  checked: string[];
  expanded: string[];
}

interface BuildFilterScopeTreeEntryProps {
  checkedFilterFields?: string[];
  activeFilterField?: string;
  filterScopeMap?: FilterScopeMap;
  layout?: DashboardLayout;
}

export default function buildFilterScopeTreeEntry({
  checkedFilterFields = [],
  activeFilterField,
  filterScopeMap = {},
  layout = {},
}: BuildFilterScopeTreeEntryProps): Record<string, FilterScopeTreeEntry> {
  const key = getKeyForFilterScopeTree({
    checkedFilterFields,
    activeFilterField,
  });
  const editingList = activeFilterField
    ? [activeFilterField]
    : checkedFilterFields;
  const selectedChartId = getSelectedChartIdForFilterScopeTree({
    checkedFilterFields,
    activeFilterField,
  });
  const nodes = getFilterScopeNodesTree({
    components: layout,
    filterFields: editingList,
    selectedChartId: selectedChartId ?? undefined,
  });
  const checkedChartIdSet = new Set<string>();
  editingList.forEach(filterField => {
    (filterScopeMap[filterField]?.checked || []).forEach(chartId => {
      checkedChartIdSet.add(`${chartId}:${filterField}`);
    });
  });
  const checked = [...checkedChartIdSet];
  const expanded = filterScopeMap[key]
    ? filterScopeMap[key].expanded || []
    : getFilterScopeParentNodes(nodes, 1);

  return {
    [key]: {
      nodes,
      nodesFiltered: [...nodes],
      checked,
      expanded,
    },
  };
}

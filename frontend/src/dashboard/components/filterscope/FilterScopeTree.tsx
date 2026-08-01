import CheckboxTree, { Node } from 'react-checkbox-tree';
import renderFilterScopeTreeNodes, {
  FilterScopeTreeNode,
} from './renderFilterScopeTreeNodes';
import treeIcons from './treeIcons';

interface FilterScopeTreeProps {
  nodes: FilterScopeTreeNode[];
  checked: (string | number)[];
  expanded: (string | number)[];
  onCheck: (checked: string[]) => void;
  onExpand: (expanded: string[]) => void;
  selectedChartId?: number | null;
}

const NOOP = () => {};

export default function FilterScopeTree({
  nodes = [],
  checked = [],
  expanded = [],
  onCheck,
  onExpand,
  selectedChartId = null,
}: FilterScopeTreeProps) {
  return (
    <CheckboxTree
      showExpandAll
      expandOnClick
      showNodeIcon={false}
      nodes={renderFilterScopeTreeNodes({ nodes, selectedChartId }) as Node[]}
      checked={checked.map(String)}
      expanded={expanded.map(String)}
      onCheck={onCheck}
      onExpand={onExpand}
      onClick={NOOP}
      icons={treeIcons}
    />
  );
}

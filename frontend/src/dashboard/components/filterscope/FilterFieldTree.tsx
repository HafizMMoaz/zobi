import CheckboxTree, { Node, OnCheckNode } from 'react-checkbox-tree';
import treeIcons from './treeIcons';
import renderFilterFieldTreeNodes, {
  FilterScopeTreeNode,
} from './renderFilterFieldTreeNodes';

interface FilterFieldTreeProps {
  activeKey?: string | null;
  nodes: FilterScopeTreeNode[];
  checked: (string | number)[];
  expanded: (string | number)[];
  onCheck: (checked: string[]) => void;
  onExpand: (expanded: string[]) => void;
  onClick: (node: OnCheckNode) => void;
}

export default function FilterFieldTree({
  activeKey = null,
  nodes = [],
  checked = [],
  expanded = [],
  onClick,
  onCheck,
  onExpand,
}: FilterFieldTreeProps) {
  return (
    <CheckboxTree
      showExpandAll
      showNodeIcon={false}
      expandOnClick
      nodes={renderFilterFieldTreeNodes({ nodes, activeKey }) as Node[]}
      checked={checked.map(String)}
      expanded={expanded.map(String)}
      onClick={onClick}
      onCheck={onCheck}
      onExpand={onExpand}
      icons={treeIcons}
    />
  );
}

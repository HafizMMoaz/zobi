import { ReactNode } from 'react';
import FilterFieldItem from './FilterFieldItem';

export interface FilterScopeTreeNode {
  value: string | number;
  label: string | ReactNode;
  type?: string;
  children?: FilterScopeTreeNode[];
}

interface RenderFilterFieldTreeNodesParams {
  nodes: FilterScopeTreeNode[] | null;
  activeKey?: string | null;
}

export default function renderFilterFieldTreeNodes({
  nodes,
  activeKey,
}: RenderFilterFieldTreeNodesParams): FilterScopeTreeNode[] {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const root = nodes[0];
  const allFilterNodes = root.children || [];
  const children = allFilterNodes.map(node => ({
    ...node,
    children: (node.children || []).map(child => {
      const { label, value } = child;
      return {
        ...child,
        label: (
          <FilterFieldItem
            isSelected={value === activeKey}
            label={String(label)}
          />
        ),
      };
    }),
  }));

  return [
    {
      ...root,
      label: <span className="root">{root.label}</span>,
      children,
    },
  ];
}

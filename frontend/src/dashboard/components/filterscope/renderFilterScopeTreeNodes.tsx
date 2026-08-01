import { ReactNode } from 'react';
import cx from 'classnames';
import { styled } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { CHART_TYPE } from 'src/dashboard/util/componentTypes';

export interface FilterScopeTreeNode {
  value: string | number;
  label: string | ReactNode;
  type?: string;
  children?: FilterScopeTreeNode[];
}

interface TraverseParams {
  currentNode: FilterScopeTreeNode;
  selectedChartId?: number | null;
}

interface RenderFilterScopeTreeNodesParams {
  nodes: FilterScopeTreeNode[] | null;
  selectedChartId?: number | null;
}

const ChartIcon = styled(Icons.BarChartOutlined)`
  ${({ theme }) => `
    position: relative;
    top: ${theme.sizeUnit - 1}px;
    color: ${theme.colorPrimary};
    margin-right: ${theme.sizeUnit * 2}px;
  `}
`;

function traverse({
  currentNode,
  selectedChartId,
}: TraverseParams): FilterScopeTreeNode {
  const { label, value, type, children } = currentNode;
  if (children && children.length) {
    const updatedChildren = children.map(child =>
      traverse({ currentNode: child, selectedChartId }),
    );
    return {
      ...currentNode,
      label: (
        <span
          className={cx(`filter-scope-type ${type?.toLowerCase()}`, {
            'selected-filter': selectedChartId === value,
          })}
        >
          {type === CHART_TYPE && <ChartIcon />}
          {label}
        </span>
      ),
      children: updatedChildren,
    };
  }
  return {
    ...currentNode,
    label: (
      <span
        className={cx(`filter-scope-type ${type?.toLowerCase()}`, {
          'selected-filter': selectedChartId === value,
        })}
      >
        {label}
      </span>
    ),
  };
}

export default function renderFilterScopeTreeNodes({
  nodes,
  selectedChartId,
}: RenderFilterScopeTreeNodesParams): FilterScopeTreeNode[] {
  if (!nodes) {
    return [];
  }

  return nodes.map(node => traverse({ currentNode: node, selectedChartId }));
}

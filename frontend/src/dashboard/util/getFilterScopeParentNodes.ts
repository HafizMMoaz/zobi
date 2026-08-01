interface FilterScopeTreeNode {
  value?: string | number;
  children?: FilterScopeTreeNode[];
}

export default function getFilterScopeParentNodes(
  nodes: FilterScopeTreeNode[] = [],
  depthLimit = -1,
): string[] {
  const parentNodes: string[] = [];
  const traverse = (
    currentNode: FilterScopeTreeNode | undefined,
    depth: number,
  ): void => {
    if (!currentNode) {
      return;
    }

    if (currentNode.children && (depthLimit === -1 || depth < depthLimit)) {
      if (currentNode.value !== undefined) {
        parentNodes.push(String(currentNode.value));
      }
      currentNode.children.forEach(child => traverse(child, depth + 1));
    }
  };

  if (nodes.length > 0) {
    nodes.forEach(node => {
      traverse(node, 0);
    });
  }

  return parentNodes;
}

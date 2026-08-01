interface ILayoutItem {
  [key: string]: {
    id: string;
    children: string[];
  };
}

interface IStructure {
  childId: string;
  layout: ILayoutItem;
}

function findParentId(structure: IStructure): string | null {
  let parentId = null;
  if (structure) {
    const { childId, layout = {} } = structure;
    // default assignment to layout only works if value is undefined, not null
    if (layout) {
      const ids = Object.keys(layout);
      for (let i = 0; i <= ids.length - 1; i += 1) {
        const id = ids[i];
        const component = layout[id] || {};
        if (id !== childId && component?.children?.includes?.(childId)) {
          parentId = id;
          break;
        }
      }
    }
  }
  return parentId;
}

const cache: Record<string, string | null> = {};

export default function findParentIdWithCache(
  structure: IStructure,
): string | null {
  let parentId = null;
  if (structure) {
    const { childId, layout = {} } = structure;
    const cachedValue = cache[childId];
    if (cachedValue) {
      const lastParent = layout?.[cachedValue] || {};
      if (lastParent?.children && lastParent?.children?.includes?.(childId)) {
        return lastParent.id;
      }
    }
    parentId = findParentId({ childId, layout });
    cache[childId] = parentId;
  }
  return parentId;
}

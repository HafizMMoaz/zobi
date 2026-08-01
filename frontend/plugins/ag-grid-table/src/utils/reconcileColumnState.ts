import {
  type ColDef,
  type ColumnState,
} from '@zobi.dev/core/components/ThemedAgGridReact';

type ColumnGroupDef = ColDef & {
  children?: ColumnDefLike[];
};

type ColumnDefLike = ColDef | ColumnGroupDef;

function hasChildren(colDef: ColumnDefLike): colDef is ColumnGroupDef {
  return 'children' in colDef;
}

export interface ReconciledColumnState {
  applyOrder: boolean;
  columnState: ColumnState[];
}

export function getLeafColumnIds(colDefs: ColumnDefLike[]): string[] {
  return colDefs.flatMap(colDef => {
    if (
      hasChildren(colDef) &&
      Array.isArray(colDef.children) &&
      colDef.children.length > 0
    ) {
      return getLeafColumnIds(colDef.children);
    }

    return typeof colDef.field === 'string' ? [colDef.field] : [];
  });
}

export default function reconcileColumnState(
  savedColumnState: ColumnState[] | undefined,
  colDefs: ColumnDefLike[],
): ReconciledColumnState | null {
  if (!Array.isArray(savedColumnState) || savedColumnState.length === 0) {
    return null;
  }

  const currentColumnIds = getLeafColumnIds(colDefs);
  const currentColumnIdSet = new Set(currentColumnIds);
  const filteredColumnState = savedColumnState.filter(
    column =>
      typeof column.colId === 'string' && currentColumnIdSet.has(column.colId),
  );

  if (filteredColumnState.length === 0) {
    return null;
  }

  const savedColumnIdSet = new Set(
    filteredColumnState.map(column => column.colId),
  );
  const hasSameColumnSet =
    currentColumnIds.length === savedColumnIdSet.size &&
    currentColumnIds.every(columnId => savedColumnIdSet.has(columnId));

  return {
    columnState: filteredColumnState,
    applyOrder: hasSameColumnSet,
  };
}

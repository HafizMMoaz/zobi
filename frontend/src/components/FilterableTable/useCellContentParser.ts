import { useCallback, useMemo } from 'react';

export type CellDataType = string | number | null;

export const NULL_STRING = 'NULL';

type Params = {
  columnKeys: string[];
  expandedColumns?: string[];
};

export function useCellContentParser({ columnKeys, expandedColumns }: Params) {
  // columns that have complex type and were expanded into sub columns
  const complexColumns = useMemo<Record<string, boolean>>(
    () =>
      columnKeys.reduce(
        (obj, key) => ({
          ...obj,
          [key]: expandedColumns?.some(name => name.startsWith(`${key}.`)),
        }),
        {},
      ),
    [expandedColumns, columnKeys],
  );

  return useCallback(
    ({
      cellData,
      columnKey,
    }: {
      cellData: CellDataType;
      columnKey: string;
    }) => {
      if (cellData === null) {
        return NULL_STRING;
      }
      const content = String(cellData);
      const firstCharacter = content.substring(0, 1);
      let truncated;
      if (firstCharacter === '[') {
        truncated = '[…]';
      } else if (firstCharacter === '{') {
        truncated = '{…}';
      } else {
        truncated = '';
      }
      return complexColumns[columnKey] ? truncated : content;
    },
    [complexColumns],
  );
}

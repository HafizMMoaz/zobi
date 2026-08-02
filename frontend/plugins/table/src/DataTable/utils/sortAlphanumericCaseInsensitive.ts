import { Row } from 'react-table';

export const sortAlphanumericCaseInsensitive = <D extends {}>(
  rowA: Row<D>,
  rowB: Row<D>,
  columnId: string,
) => {
  const valueA = rowA.values[columnId];
  const valueB = rowB.values[columnId];

  if (!valueA || typeof valueA !== 'string') {
    return -1;
  }
  if (!valueB || typeof valueB !== 'string') {
    return 1;
  }
  return valueA.localeCompare(valueB);
};

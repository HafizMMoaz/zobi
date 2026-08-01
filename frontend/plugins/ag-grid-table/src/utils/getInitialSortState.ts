// All ag grid sort related stuff
import {
  GridState,
  SortModelItem,
} from '@zobi.dev/core/components/ThemedAgGridReact';
import { SortByItem } from '../types';

const getInitialSortState = (sortBy?: SortByItem[]): SortModelItem[] => {
  if (Array.isArray(sortBy) && sortBy.length > 0) {
    return [
      {
        colId: sortBy[0]?.id,
        sort: sortBy[0]?.desc ? 'desc' : 'asc',
      },
    ];
  }
  return [];
};

export const shouldSort = ({
  colId,
  sortDir,
  percentMetrics,
  serverPagination,
  gridInitialState,
}: {
  colId: string;
  sortDir: string | null;
  percentMetrics: string[];
  serverPagination: boolean;
  gridInitialState: GridState;
}) => {
  // percent metrics are not sortable
  if (percentMetrics.includes(colId)) return false;
  // if server pagination is not enabled, return false
  // since this is server pagination sort
  if (!serverPagination) return false;

  const {
    colId: initialColId = '',
    sort: initialSortDir,
  }: Partial<SortModelItem> = gridInitialState?.sort?.sortModel?.[0] || {};

  // if the initial sort is the same as the current sort, return false
  if (initialColId === colId && initialSortDir === sortDir) return false;

  return true;
};

export default getInitialSortState;

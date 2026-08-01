/* eslint-disable camelcase */
import { SetDataMaskHook } from '@zobi-ui/core';
import { SortByItem } from '../types';

interface TableOwnState {
  currentPage?: number;
  pageSize?: number;
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
  searchText?: string;
  sortBy?: SortByItem[];
}

export const updateTableOwnState = (
  setDataMask: SetDataMaskHook = () => {},
  modifiedOwnState: TableOwnState,
) =>
  setDataMask({
    ownState: modifiedOwnState,
  });

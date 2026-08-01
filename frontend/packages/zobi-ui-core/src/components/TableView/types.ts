import { SortingRule } from 'react-table';

export type SortByType = SortingRule<string>[];

export interface ServerPagination {
  pageIndex: number;
  sortBy?: SortByType;
}

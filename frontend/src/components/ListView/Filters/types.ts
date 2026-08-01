import { ReactNode } from 'react';

export interface BaseFilter {
  Header: ReactNode;
  initialValue: any;
}
export type FilterHandler = {
  clearFilter: () => void;
};

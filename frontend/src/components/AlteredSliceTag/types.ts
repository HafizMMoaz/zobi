import type { QueryFormData } from '@zobi.dev/core';
import { DiffType } from 'src/types/DiffType';

export interface AlteredSliceTagProps {
  className?: string;
  diffs: Record<string, DiffType>;
  origFormData: QueryFormData;
  currentFormData: QueryFormData;
}

export interface ControlMap {
  [key: string]: {
    label?: string;
    type?: string;
  };
}

export type RowType = {
  before: string | number;
  after: string | number;
  control: string;
};

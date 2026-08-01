import { GenericDataType } from '@zobi/core/common';

export type ResultsPage = {
  total: number;
  data: Record<string, any>[];
  colNames: string[];
  colTypes: GenericDataType[];
};

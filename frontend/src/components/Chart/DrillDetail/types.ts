import { GenericDataType } from '@zobi.dev/extension-api/common';

export type ResultsPage = {
  total: number;
  data: Record<string, any>[];
  colNames: string[];
  colTypes: GenericDataType[];
};

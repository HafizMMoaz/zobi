import { Column, Metric } from '@zobi-ui/core';

export enum DrillByType {
  Chart,
  Table,
}

export type Dataset = {
  changed_by?: {
    first_name: string;
    last_name: string;
  };
  created_by?: {
    first_name: string;
    last_name: string;
  };
  changed_on_humanized?: string;
  created_on_humanized?: string;
  description?: string;
  table_name?: string;
  owners?: {
    first_name: string;
    last_name: string;
  }[];
  columns?: Column[];
  drillable_columns?: Column[];
  metrics?: Metric[];
  verbose_map?: Record<string, string>;
};

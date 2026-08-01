import type { DatabaseObject } from 'src/components';

export enum DatasetActionType {
  SelectDatabase,
  SelectCatalog,
  SelectSchema,
  SelectTable,
  ChangeDataset,
}

export interface DatasetObject {
  db: DatabaseObject & { owners: [number] };
  catalog?: string | null;
  schema?: string | null;
  dataset_name: string;
  table_name?: string | null;
  explore_url?: string;
}

export interface DatasetReducerPayloadType {
  name: string;
  value?: string;
}

export type Schema = {
  schema?: string | null | undefined;
};

export type DSReducerActionType =
  | {
      type: DatasetActionType.SelectDatabase;
      payload: Partial<DatasetObject>;
    }
  | {
      type:
        | DatasetActionType.ChangeDataset
        | DatasetActionType.SelectCatalog
        | DatasetActionType.SelectSchema
        | DatasetActionType.SelectTable;
      payload: DatasetReducerPayloadType;
    };

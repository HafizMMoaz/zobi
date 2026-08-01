import { DatasetObject } from 'src/features/datasets/AddDataset/types';
import { ITableColumn } from './types';

export const exampleColumns: ITableColumn[] = [
  {
    name: 'name',
    type: 'STRING',
  },
  {
    name: 'height_in_inches',
    type: 'NUMBER',
  },
  {
    name: 'birth_date',
    type: 'DATE',
  },
];

export const exampleDataset: DatasetObject[] = [
  {
    db: {
      id: 1,
      database_name: 'test_database',
      owners: [1],
      backend: 'test_backend',
    },
    schema: 'test_schema',
    dataset_name: 'example_dataset',
    table_name: 'example_table',
  },
];

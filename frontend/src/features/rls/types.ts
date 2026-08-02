export enum FilterType {
  Regular = 'Regular',
  Base = 'Base',
}

export type RLSObject = {
  id?: number;
  name: string;
  filter_type: FilterType;
  tables?: TableObject[];
  roles?: RoleObject[];
  group_key?: string;
  clause?: string;
  description?: string;
};

export type TableObject = {
  key: any;
  id?: number;
  label?: string;
  value?: number | string;
  schema?: string;
  table_name?: string;
};

export type RoleObject = {
  key: any;
  id?: number;
  label?: string;
  value?: number | string;
  name?: string;
};


export enum MetadataType {
  Dashboards = 'dashboards',
  Description = 'description',
  LastModified = 'lastModified',
  Owner = 'owner',
  Rows = 'rows',
  Sql = 'sql',
  Table = 'table',
  Tags = 'tags',
}

export type Dashboards = {
  type: MetadataType.Dashboards;
  title: string;
  description?: string;
  onClick?: (type: string) => void;
};

export type Description = {
  type: MetadataType.Description;
  value: string;
  onClick?: (type: string) => void;
};

export type LastModified = {
  type: MetadataType.LastModified;
  value: string;
  modifiedBy: string;
  onClick?: (type: string) => void;
};

export type Owner = {
  type: MetadataType.Owner;
  createdBy: string;
  owners?: string[] | string;
  createdOn: string;
  onClick?: (type: string) => void;
};

export type Rows = {
  type: MetadataType.Rows;
  title: string;
  onClick?: (type: string) => void;
};

export type Sql = {
  type: MetadataType.Sql;
  title: string;
  onClick?: (type: string) => void;
};

export type Table = {
  type: MetadataType.Table;
  title: string;
  onClick?: (type: string) => void;
};

export type Tags = {
  type: MetadataType.Tags;
  values: string[];
  onClick?: (type: string) => void;
};

export type ContentType =
  | Dashboards
  | Description
  | LastModified
  | Owner
  | Rows
  | Sql
  | Table
  | Tags;

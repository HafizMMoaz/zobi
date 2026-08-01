import Owner from './Owner';

export default interface Dataset {
  changed_by_name: string;
  changed_by: string;
  changed_on_delta_humanized: string;
  database: {
    id: string;
    database_name: string;
  } | null;
  kind: string;
  source_type?: 'database' | 'semantic_layer';
  explore_url: string;
  id: number;
  owners: Array<Owner>;
  schema: string | null;
  catalog?: string | null;
  table_name: string;
  description?: string | null;
  cache_timeout?: number | null;
  default_endpoint?: string | null;
  is_sqllab_view?: boolean;
  is_managed_externally?: boolean;
}

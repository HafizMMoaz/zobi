export default interface Database {
  id: number;
  allow_run_async: boolean;
  database_name: string;
  masked_encrypted_extra: string;
  extra: string;
  impersonate_user: boolean;
  server_cert: string;
  sqlalchemy_uri: string;
  catalog: object;
  parameters: any;
  disable_drill_to_detail?: boolean;
  allow_multi_catalog?: boolean;
}

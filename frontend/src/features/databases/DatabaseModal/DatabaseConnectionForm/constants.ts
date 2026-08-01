import { getExtensionsRegistry } from '@zobi.dev/core';
import {
  accessTokenField,
  databaseField,
  defaultCatalogField,
  defaultSchemaField,
  displayField,
  forceSSLField,
  hostField,
  httpPath,
  httpPathField,
  passwordField,
  portField,
  queryField,
  projectIdfield,
  usernameField,
} from './CommonParameters';
import { OAuth2ClientField } from './OAuth2ClientField';
import { validatedInputField } from './ValidatedInputField';
import { EncryptedField } from './EncryptedField';
import { TableCatalog } from './TableCatalog';
import SSHTunnelSwitch from '../SSHTunnelSwitch';

export const FormFieldOrder = [
  'host',
  'port',
  'database',
  'default_catalog',
  'default_schema',
  'username',
  'password',
  'access_token',
  'http_path',
  'http_path_field',
  'database_name',
  'project_id',
  'catalog',
  'credentials_info',
  'service_account_info',
  'query',
  'encryption',
  'account',
  'warehouse',
  'role',
  'ssh',
  'oauth2_client_info',
];

const extensionsRegistry = getExtensionsRegistry();

const SSHTunnelSwitchComponent =
  extensionsRegistry.get('ssh_tunnel.form.switch') ?? SSHTunnelSwitch;

export const FORM_FIELD_MAP = {
  host: hostField,
  http_path: httpPath,
  http_path_field: httpPathField,
  port: portField,
  database: databaseField,
  default_catalog: defaultCatalogField,
  default_schema: defaultSchemaField,
  username: usernameField,
  password: passwordField,
  oauth2_client_info: OAuth2ClientField,
  access_token: accessTokenField,
  database_name: displayField,
  query: queryField,
  encryption: forceSSLField,
  credentials_info: EncryptedField,
  service_account_info: EncryptedField,
  catalog: TableCatalog,
  warehouse: validatedInputField,
  role: validatedInputField,
  account: validatedInputField,
  ssh: SSHTunnelSwitchComponent,
  project_id: projectIdfield,
};



import { ZobiClient } from '../../../connection';
import { Datasource } from '../../types/Datasource';
import { BaseParams } from '../types';

export interface Params extends BaseParams {
  datasourceKey: string;
}

export default function getDatasourceMetadata({
  client = ZobiClient,
  datasourceKey,
  requestConfig,
}: Params) {
  return client
    .get({
      endpoint: `/zobi/fetch_datasource_metadata?datasourceKey=${datasourceKey}`,
      ...requestConfig,
    })
    .then(response => response.json as Datasource);
}

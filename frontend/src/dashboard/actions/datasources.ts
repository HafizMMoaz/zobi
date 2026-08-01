import { Dispatch } from 'redux';
import { ZobiClient } from '@zobi-ui/core';
import { Datasource, RootState } from 'src/dashboard/types';

// update datasources index for Dashboard
export enum DatasourcesAction {
  SetDatasources = 'SET_DATASOURCES',
  SetDatasource = 'SET_DATASOURCE',
}

export type DatasourcesActionPayload =
  | {
      type: DatasourcesAction.SetDatasources;
      datasources: Datasource[] | null;
    }
  | {
      type: DatasourcesAction.SetDatasource;
      key: Datasource['uid'];
      datasource: Datasource;
    };

export function setDatasources(datasources: Datasource[] | null) {
  return {
    type: DatasourcesAction.SetDatasources,
    datasources,
  };
}

export function setDatasource(datasource: Datasource, key: string) {
  return {
    type: DatasourcesAction.SetDatasource,
    key,
    datasource,
  };
}

export function fetchDatasourceMetadata(key: string) {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const { datasources } = getState();
    const datasource = datasources[key];

    if (datasource) {
      return dispatch(setDatasource(datasource, key));
    }

    return ZobiClient.get({
      endpoint: `/zobi/fetch_datasource_metadata?datasourceKey=${key}`,
    }).then(({ json }) => dispatch(setDatasource(json as Datasource, key)));
  };
}

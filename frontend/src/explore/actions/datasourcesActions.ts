
import { Dispatch, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Dataset } from '@zobi.dev/chart-controls';
import { ZobiClient, getClientErrorObject } from '@zobi.dev/core';
import { addDangerToast } from 'src/components/MessageToasts/actions';
import { updateFormDataByDatasource } from './exploreActions';
import { ExplorePageState } from '../types';

interface SaveDatasetRequest {
  data: {
    schema?: string;
    sql?: string;
    dbId?: number;
    templateParams?: string;
    datasourceName: string;
    columns: unknown[];
  };
}

export const SET_DATASOURCE = 'SET_DATASOURCE';
export interface SetDatasource {
  type: string;
  datasource: Dataset;
}
export function setDatasource(datasource: Dataset) {
  return { type: SET_DATASOURCE, datasource };
}

export function changeDatasource(newDatasource: Dataset) {
  return function (dispatch: Dispatch, getState: () => ExplorePageState) {
    const {
      explore: { datasource: prevDatasource },
    } = getState();
    dispatch(setDatasource(newDatasource));
    dispatch(updateFormDataByDatasource(prevDatasource, newDatasource));
  };
}

export function saveDataset({
  schema,
  sql,
  database,
  templateParams,
  datasourceName,
  columns,
}: Omit<SaveDatasetRequest['data'], 'dbId'> & { database: { id: number } }) {
  return async function (dispatch: ThunkDispatch<any, undefined, AnyAction>) {
    // Create a dataset object
    try {
      const {
        json: { data },
      } = await ZobiClient.post({
        endpoint: '/api/v1/dataset/',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database: database?.id,
          table_name: datasourceName,
          schema,
          sql,
          template_params: templateParams,
          columns,
        }),
      });
      // Update form_data to point to new dataset
      dispatch(changeDatasource(data));
      return data;
    } catch (error) {
      getClientErrorObject(error).then(e => {
        dispatch(addDangerToast(e.error));
      });
      throw error;
    }
  };
}

export const datasourcesActions = {
  setDatasource,
  changeDatasource,
  saveDataset,
};

export type AnyDatasourcesAction = SetDatasource;

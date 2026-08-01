import { keyBy } from 'lodash';
import { DatasourcesState } from 'src/dashboard/types';
import {
  DatasourcesActionPayload,
  DatasourcesAction,
} from '../actions/datasources';

export default function datasourcesReducer(
  datasources: DatasourcesState | undefined,
  action: DatasourcesActionPayload,
) {
  if (action.type === DatasourcesAction.SetDatasources) {
    return {
      ...datasources,
      ...keyBy(action.datasources, 'uid'),
    };
  }
  if (action.type === DatasourcesAction.SetDatasource) {
    return {
      ...datasources,
      [action.key]: action.datasource,
    };
  }
  return datasources || {};
}

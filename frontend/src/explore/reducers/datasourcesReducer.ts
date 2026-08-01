import { Dataset } from '@zobi-ui/chart-controls';
import { getDatasourceUid } from 'src/utils/getDatasourceUid';
import {
  AnyDatasourcesAction,
  SET_DATASOURCE,
} from '../actions/datasourcesActions';
import { HYDRATE_EXPLORE, HydrateExplore } from '../actions/hydrateExplore';

export default function datasourcesReducer(
  // TODO: change type to include other datasource types
  datasources: { [key: string]: Dataset },
  action: AnyDatasourcesAction | HydrateExplore,
) {
  if (action.type === SET_DATASOURCE) {
    return {
      ...datasources,
      [getDatasourceUid(action.datasource)]: action.datasource,
    };
  }
  if (action.type === HYDRATE_EXPLORE) {
    return { ...(action as HydrateExplore).data.datasources };
  }
  return datasources || {};
}

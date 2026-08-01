import { t } from '@zobi.dev/extension-api/translation';

import {
  FETCH_ALL_SLICES_FAILED,
  FETCH_ALL_SLICES_STARTED,
  ADD_SLICES,
  SET_SLICES,
  SliceEntitiesState,
  SliceEntitiesActionPayload,
} from '../actions/sliceEntities';
import { HYDRATE_DASHBOARD } from '../actions/hydrate';

export const initSliceEntities: SliceEntitiesState = {
  slices: {},
  isLoading: true,
  errorMessage: null,
  lastUpdated: 0,
};

export default function sliceEntitiesReducer(
  state: SliceEntitiesState = initSliceEntities,
  action: SliceEntitiesActionPayload,
): SliceEntitiesState {
  switch (action.type) {
    case HYDRATE_DASHBOARD:
      return {
        ...action.data.sliceEntities,
      };
    case FETCH_ALL_SLICES_STARTED:
      return {
        ...state,
        isLoading: true,
      };
    case ADD_SLICES:
      return {
        ...state,
        isLoading: false,
        slices: { ...state.slices, ...action.payload.slices },
        lastUpdated: new Date().getTime(),
      };
    case SET_SLICES:
      return {
        ...state,
        isLoading: false,
        slices: { ...action.payload.slices },
        lastUpdated: new Date().getTime(),
      };
    case FETCH_ALL_SLICES_FAILED:
      return {
        ...state,
        isLoading: false,
        lastUpdated: new Date().getTime(),
        errorMessage:
          action.payload.error || t('Could not fetch all saved charts'),
      };
    default:
      return state;
  }
}

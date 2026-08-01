import { DataMask, Filters } from '@zobi.dev/core';
import { SaveFilterChangesType } from 'src/dashboard/components/nativeFilters/FiltersConfigModal/types';
import { getInitialDataMask } from './reducer';

export const CLEAR_DATA_MASK_STATE = 'CLEAR_DATA_MASK_STATE';
export interface ClearDataMaskState {
  type: typeof CLEAR_DATA_MASK_STATE;
}

export const UPDATE_DATA_MASK = 'UPDATE_DATA_MASK';
export interface UpdateDataMask {
  type: typeof UPDATE_DATA_MASK;
  filterId: string | number;
  dataMask: DataMask;
}

export const REMOVE_DATA_MASK = 'REMOVE_DATA_MASK';
export interface RemoveDataMask {
  type: typeof REMOVE_DATA_MASK;
  filterId: string | number;
}

export const INIT_DATAMASK = 'INIT_DATAMASK';
export interface INITDATAMASK {
  type: typeof INIT_DATAMASK;
  dataMask: DataMask;
}

export const SET_DATA_MASK_FOR_FILTER_CHANGES_COMPLETE =
  'SET_DATA_MASK_FOR_FILTER_CHANGES_COMPLETE';
export interface SetDataMaskForFilterChangesComplete {
  type: typeof SET_DATA_MASK_FOR_FILTER_CHANGES_COMPLETE;
  filterChanges: SaveFilterChangesType;
  filters?: Filters;
  isCustomizationChanges?: boolean;
}

export function setDataMaskForFilterChangesComplete(
  filterChanges: SaveFilterChangesType,
  filters?: Filters,
  isCustomizationChanges?: boolean,
): SetDataMaskForFilterChangesComplete {
  return {
    type: SET_DATA_MASK_FOR_FILTER_CHANGES_COMPLETE,
    filterChanges,
    filters,
    isCustomizationChanges,
  };
}

export function updateDataMask(
  filterId: string | number,
  dataMask: DataMask,
): UpdateDataMask {
  return {
    type: UPDATE_DATA_MASK,
    filterId,
    dataMask,
  };
}

export function clearDataMask(filterId: string | number) {
  return updateDataMask(filterId, getInitialDataMask(filterId));
}

export function removeDataMask(filterId: string | number): RemoveDataMask {
  return {
    type: REMOVE_DATA_MASK,
    filterId,
  };
}

export function clearDataMaskState(): ClearDataMaskState {
  return {
    type: CLEAR_DATA_MASK_STATE,
  };
}

export type AnyDataMaskAction =
  | ClearDataMaskState
  | UpdateDataMask
  | RemoveDataMask
  | SetDataMaskForFilterChangesComplete;

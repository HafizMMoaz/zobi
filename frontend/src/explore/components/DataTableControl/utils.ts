import { ensureIsArray } from '@zobi.dev/core';
import {
  LocalStorageKeys,
  setItem,
  getItem,
} from 'src/utils/localStorageHelpers';

export const getTimeColumns = (datasourceId?: string): string[] => {
  const colsMap = getItem(
    LocalStorageKeys.ExploreDataTableOriginalFormattedTimeColumns,
    {},
  );
  if (datasourceId === undefined) {
    return [];
  }
  return ensureIsArray(colsMap[datasourceId]);
};

export const setTimeColumns = (datasourceId: string, columns: string[]) => {
  const colsMap = getItem(
    LocalStorageKeys.ExploreDataTableOriginalFormattedTimeColumns,
    {},
  );
  setItem(LocalStorageKeys.ExploreDataTableOriginalFormattedTimeColumns, {
    ...colsMap,
    [datasourceId]: columns,
  });
};

import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { DataMaskStateWithId, ExtraFormData } from '@zobi.dev/core';
import { RootState } from 'src/dashboard/types';
import { mergeExtraFormData } from '../../utils';
import {
  FilterConfigMap,
  resolveTransitiveParentIds,
} from '../../dependencyGraph';

/**
 * Resolve the transitive ancestor ids for a given filter from the live
 * native-filter configuration in Redux. Shared between
 * `useFilterDependencies` and the readiness guard in `FilterValue` so they
 * always agree on which parents count.
 */
export function useTransitiveParentIds(id: string): string[] {
  const filterConfig = useSelector<RootState, FilterConfigMap | undefined>(
    state => state.nativeFilters?.filters,
    shallowEqual,
  );

  return useMemo(
    () => resolveTransitiveParentIds(id, filterConfig ?? {}),
    [id, filterConfig],
  );
}

export function useFilterDependencies(
  id: string,
  dataMaskSelected?: DataMaskStateWithId,
): ExtraFormData {
  const dependencyIds = useTransitiveParentIds(id);

  return useMemo(() => {
    let dependencies: ExtraFormData = {};
    dependencyIds.forEach(parentId => {
      const parentState = dataMaskSelected?.[parentId];
      dependencies = mergeExtraFormData(
        dependencies,
        parentState?.extraFormData,
      );
    });
    return dependencies;
  }, [dataMaskSelected, dependencyIds]);
}

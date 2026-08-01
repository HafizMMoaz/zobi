import { useEffect } from 'react';
import { NativeFilterType, usePrevious } from '@zobi-ui/core';
import { FilterRemoval } from './types';


export const useRemoveCurrentFilter = (
  removedFilters: Record<string, FilterRemoval>,
  currentFilterId: string,
  orderedFilters: string[],
  setCurrentFilterId: (id: string) => void,
) => {
  useEffect(() => {
    // if the currently viewed filter is fully removed, change to another tab
    const currentFilterRemoved = removedFilters[currentFilterId];
    if (currentFilterRemoved && !currentFilterRemoved.isPending) {
      const nextFilterId = orderedFilters.find(
        filterId => !removedFilters[filterId] && filterId !== currentFilterId,
      );

      if (nextFilterId) {
        setCurrentFilterId(nextFilterId);
      }
    }
  }, [currentFilterId, removedFilters, orderedFilters, setCurrentFilterId]);
};

export const useOpenModal = (
  isOpen: boolean,
  addFilter: (type: NativeFilterType) => void,
  createNewOnOpen?: boolean,
) => {
  const wasOpen = usePrevious(isOpen);
  // if this is a "create" modal rather than an "edit" modal,
  // add a filter on modal open
  useEffect(() => {
    if (createNewOnOpen && isOpen && !wasOpen) {
      addFilter(NativeFilterType.NativeFilter);
    }
  }, [createNewOnOpen, isOpen, wasOpen, addFilter]);
};

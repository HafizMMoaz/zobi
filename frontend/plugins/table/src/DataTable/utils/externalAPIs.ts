import type { SetDataMaskHook } from '@zobi.dev/core';
import type { TableOwnState } from '../types/react-table';

export const updateExternalFormData = (
  setDataMask: SetDataMaskHook = () => {},
  pageNumber: number,
  pageSize: number,
) => {
  setDataMask({
    ownState: {
      currentPage: pageNumber,
      pageSize,
    },
  });
};

export const updateTableOwnState = (
  setDataMask: SetDataMaskHook = () => {},
  modifiedOwnState: TableOwnState,
) => {
  setDataMask({
    ownState: modifiedOwnState,
  });
};

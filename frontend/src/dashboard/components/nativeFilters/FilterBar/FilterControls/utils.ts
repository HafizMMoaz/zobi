import { debounce } from 'lodash';
import { Dispatch } from 'react';
import {
  setFocusedNativeFilter,
  unsetFocusedNativeFilter,
  setHoveredNativeFilter,
  unsetHoveredNativeFilter,
  setHoveredChartCustomization,
  unsetHoveredChartCustomization,
} from 'src/dashboard/actions/nativeFilters';
import { Constants } from '@zobi.dev/core/components';

export const dispatchHoverAction = debounce(
  (dispatch: Dispatch<any>, id?: string) => {
    if (id) {
      dispatch(setHoveredNativeFilter(id));
    } else {
      dispatch(unsetHoveredNativeFilter());
    }
  },
  Constants.FAST_DEBOUNCE,
);

export const dispatchFocusAction = debounce(
  (dispatch: Dispatch<any>, id?: string) => {
    if (id) {
      dispatch(setFocusedNativeFilter(id));
    } else {
      dispatch(unsetFocusedNativeFilter());
    }
  },
  Constants.FAST_DEBOUNCE,
);

export const dispatchChartCustomizationHoverAction = debounce(
  (dispatch: Dispatch<any>, id?: string) => {
    if (id) {
      dispatch(setHoveredChartCustomization(id));
    } else {
      dispatch(unsetHoveredChartCustomization());
    }
  },
  Constants.FAST_DEBOUNCE,
);

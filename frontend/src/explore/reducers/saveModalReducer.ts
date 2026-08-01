/* eslint camelcase: 0 */
import * as actions from '../actions/saveModalActions';
import { HYDRATE_EXPLORE } from '../actions/hydrateExplore';

interface SaveModalState {
  isVisible?: boolean;
  dashboards?: unknown[];
  saveModalAlert?: string;
  data?: unknown;
}

interface SaveModalAction {
  type: string;
  isVisible?: boolean;
  choices?: unknown[];
  userId?: string;
  data?: unknown;
}

export default function saveModalReducer(
  state: SaveModalState = {},
  action: SaveModalAction,
): SaveModalState {
  const actionHandlers: Record<string, () => SaveModalState> = {
    [actions.SET_SAVE_CHART_MODAL_VISIBILITY]() {
      return { ...state, isVisible: action.isVisible };
    },
    [actions.FETCH_DASHBOARDS_SUCCEEDED]() {
      return { ...state, dashboards: action.choices };
    },
    [actions.FETCH_DASHBOARDS_FAILED]() {
      return {
        ...state,
        saveModalAlert: `fetching dashboards failed for ${action.userId}`,
      };
    },
    [actions.SAVE_SLICE_FAILED]() {
      return { ...state, saveModalAlert: 'Failed to save slice' };
    },
    [actions.SAVE_SLICE_SUCCESS]() {
      return { ...state, data: action.data };
    },
    [HYDRATE_EXPLORE]() {
      const payload = action.data as { saveModal?: SaveModalState } | undefined;
      return { ...payload?.saveModal };
    },
  };

  if (action.type in actionHandlers) {
    return actionHandlers[action.type]();
  }
  return state;
}

import { DASHBOARD_ROOT_TYPE, DASHBOARD_GRID_TYPE } from './componentTypes';
import type { ComponentType } from '../types';

import {
  DASHBOARD_GRID_ID,
  DASHBOARD_ROOT_ID,
  DASHBOARD_VERSION_KEY,
} from './constants';

// Basic layout item for empty dashboard (simplified version without meta)
interface BasicLayoutItem {
  type: ComponentType;
  id: string;
  children: string[];
  parents?: string[];
}

// Empty layout structure
type EmptyLayout = {
  [DASHBOARD_VERSION_KEY]: string;
  [DASHBOARD_ROOT_ID]: BasicLayoutItem;
  [DASHBOARD_GRID_ID]: BasicLayoutItem;
};

export default function getEmptyLayout(): EmptyLayout {
  return {
    [DASHBOARD_VERSION_KEY]: 'v2',
    [DASHBOARD_ROOT_ID]: {
      type: DASHBOARD_ROOT_TYPE,
      id: DASHBOARD_ROOT_ID,
      children: [DASHBOARD_GRID_ID],
    },
    [DASHBOARD_GRID_ID]: {
      type: DASHBOARD_GRID_TYPE,
      id: DASHBOARD_GRID_ID,
      children: [],
      parents: [DASHBOARD_ROOT_ID],
    },
  };
}

import {
  DASHBOARD_GRID_TYPE,
  CHART_TYPE,
  COLUMN_TYPE,
  MARKDOWN_TYPE,
  TAB_TYPE,
} from './componentTypes';
import { ComponentType } from '../types';

interface WrapChildParams {
  parentType: ComponentType | undefined | null;
  childType: ComponentType | undefined | null;
}

type ParentTypes = typeof DASHBOARD_GRID_TYPE | typeof TAB_TYPE;
type ChildTypes = typeof CHART_TYPE | typeof COLUMN_TYPE | typeof MARKDOWN_TYPE;

const typeToWrapChildLookup: Record<
  ParentTypes,
  Record<ChildTypes, boolean>
> = {
  [DASHBOARD_GRID_TYPE]: {
    [CHART_TYPE]: true,
    [COLUMN_TYPE]: true,
    [MARKDOWN_TYPE]: true,
  },

  [TAB_TYPE]: {
    [CHART_TYPE]: true,
    [COLUMN_TYPE]: true,
    [MARKDOWN_TYPE]: true,
  },
};

export default function shouldWrapChildInRow({
  parentType,
  childType,
}: WrapChildParams): boolean {
  if (!parentType || !childType) return false;

  const wrapChildLookup = typeToWrapChildLookup[parentType as ParentTypes];
  if (!wrapChildLookup) return false;

  return Boolean(wrapChildLookup[childType as ChildTypes]);
}

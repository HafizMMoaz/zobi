import findParentId from './findParentId';
import { GRID_MIN_COLUMN_COUNT, GRID_COLUMN_COUNT } from './constants';
import {
  ROW_TYPE,
  COLUMN_TYPE,
  MARKDOWN_TYPE,
  CHART_TYPE,
  DYNAMIC_TYPE,
} from './componentTypes';
import { DashboardComponent, DashboardComponentMap } from '../types';

interface GetTotalChildWidthParams {
  id: string;
  components: DashboardComponentMap;
}

interface DetailedWidth {
  width: number | undefined;
  occupiedWidth: number | undefined;
  minimumWidth: number | undefined;
}

interface GetDetailedComponentWidthParams {
  id?: string | null;
  component?: DashboardComponent;
  components?: DashboardComponentMap;
}

function getTotalChildWidth({
  id,
  components,
}: GetTotalChildWidthParams): number {
  const component = components[id];
  if (!component) return 0;

  let width = 0;

  (component.children || []).forEach(childId => {
    const child = components[childId];
    width += child?.meta?.width || 0;
  });

  return width;
}

export default function getDetailedComponentWidth({
  // pass either an id, or a component
  id,
  component: passedComponent,
  components = {},
}: GetDetailedComponentWidthParams): DetailedWidth {
  const result: DetailedWidth = {
    width: undefined,
    occupiedWidth: undefined,
    minimumWidth: undefined,
  };

  const component = passedComponent || (id ? components[id] : undefined);
  if (!component) return result;

  // note these remain as undefined if the component has no defined width
  result.width = component.meta?.width;
  result.occupiedWidth = result.width;

  if (component.type === ROW_TYPE) {
    // not all rows have width 12, e
    result.width =
      getDetailedComponentWidth({
        id: findParentId({
          childId: component.id,
          layout: components,
        }),
        components,
      }).width || GRID_COLUMN_COUNT;
    result.occupiedWidth = getTotalChildWidth({ id: component.id, components });
    result.minimumWidth = result.occupiedWidth || GRID_MIN_COLUMN_COUNT;
  } else if (component.type === COLUMN_TYPE) {
    // find the width of the largest child, only rows count
    result.minimumWidth = GRID_MIN_COLUMN_COUNT;
    result.occupiedWidth = 0;
    (component.children || []).forEach(childId => {
      // rows don't have widths, so find the width of its children
      if (components[childId].type === ROW_TYPE) {
        result.minimumWidth = Math.max(
          result.minimumWidth ?? 0,
          getTotalChildWidth({ id: childId, components }),
        );
      }
    });
  } else if (
    component.type === DYNAMIC_TYPE ||
    component.type === MARKDOWN_TYPE ||
    component.type === CHART_TYPE
  ) {
    result.minimumWidth = GRID_MIN_COLUMN_COUNT;
  }

  return result;
}


import { ReactNode, isValidElement } from 'react';
import {
  ascending as d3ascending,
  quantile as d3quantile,
  sum as d3sum,
  mean as d3mean,
  min as d3min,
  max as d3max,
  median as d3median,
  variance as d3variance,
  deviation as d3deviation,
} from 'd3-array';
import {
  CategoricalColorScale,
  ContextMenuFilters,
  FilterState,
  JsonObject,
  JsonValue,
  QueryFormData,
  SetDataMaskHook,
} from '@zobi.dev/core';
import { Layer, PickingInfo, Color } from '@deck.gl/core';
import { ScaleLinear } from 'd3-scale';
import { ColorBreakpointType } from '../types';
import sandboxedEval from '../utils/sandbox';
import { TooltipProps } from '../components/Tooltip';
import { getCrossFilterDataMask } from '../utils/crossFiltersDataMask';
import { COLOR_SCHEME_TYPES, ColorSchemeType } from '../utilities/utils';
import { hexToRGB } from '../utils/colors';
import { DEFAULT_DECKGL_COLOR } from '../utilities/Shared_DeckGL';

export function commonLayerProps({
  formData,
  setDataMask,
  setTooltip,
  setTooltipContent,
  onSelect,
  onContextMenu,
  filterState,
  emitCrossFilters,
}: {
  formData: QueryFormData;
  setDataMask?: SetDataMaskHook;
  setTooltip: (tooltip: TooltipProps['tooltip']) => void;
  setTooltipContent: (content: JsonObject) => ReactNode;
  onSelect?: (value: JsonValue) => void;
  filterState?: FilterState;
  // Matches `GetLayerTypeParams.onContextMenu`; `HandlerFunction` takes
  // `unknown[]`, which every caller's narrower handler fails to satisfy
  // because parameters are contravariant.
  onContextMenu?: (
    clientX: number,
    clientY: number,
    filters?: ContextMenuFilters,
  ) => void;
  emitCrossFilters?: boolean;
}) {
  const fd = formData;
  let onHover;
  let tooltipContentGenerator = setTooltipContent;
  if (fd.js_tooltip) {
    tooltipContentGenerator = sandboxedEval(fd.js_tooltip);
  }
  if (tooltipContentGenerator) {
    let currentTooltipContent: ReactNode = null;

    const isCustomTooltip = (content: ReactNode): boolean =>
      isValidElement(content) &&
      content.props?.['data-tooltip-type'] === 'custom';

    onHover = (o: JsonObject) => {
      if (o.picked) {
        currentTooltipContent = tooltipContentGenerator(o);
      }

      if (
        currentTooltipContent &&
        (o.picked || isCustomTooltip(currentTooltipContent))
      ) {
        setTooltip({
          content: currentTooltipContent,
          x: o.x,
          y: o.y,
        });
      } else {
        setTooltip(null);
        currentTooltipContent = null;
      }
      return true;
    };
  }

  let onClick;
  if (fd.js_onclick_href) {
    onClick = (o: any) => {
      const href = sandboxedEval(fd.js_onclick_href)(o);
      window.open(href);
      return true;
    };
  } else if (fd.table_filter && onSelect !== undefined) {
    onClick = (o: any) => {
      onSelect(o.object[fd.line_column]);
      return true;
    };
  } else if (emitCrossFilters) {
    onClick = (data: PickingInfo, event: any) => {
      const crossFilters = getCrossFilterDataMask({
        data,
        filterState,
        formData,
      });

      // deck.gl v9 event shape: { type, offsetCenter, srcEvent, tapCount }.
      // Older code checked event.leftButton / event.rightButton which no
      // longer exist; dispatch on event.type and the underlying MouseEvent
      // button instead.
      const srcEvent = event?.srcEvent;
      const isContextMenu =
        event?.type === 'contextmenu' || srcEvent?.button === 2;
      const isLeftClick =
        event?.type === 'click' && (srcEvent?.button ?? 0) === 0;

      if (isLeftClick && setDataMask !== undefined && crossFilters) {
        setDataMask(crossFilters.dataMask);
      } else if (isContextMenu && onContextMenu !== undefined) {
        const center = event?.offsetCenter ?? event?.center ?? { x: 0, y: 0 };
        // `drillBy` is optional and requires `filters` and `groupbyFieldName`,
        // which are not available here, so it is omitted rather than passed
        // as an empty object.
        onContextMenu(center.x, center.y, {
          drillToDetail: [],
          crossFilter: crossFilters,
        });
      }

      return true;
    };
  }

  return {
    onClick: onClick as Layer['onClick'],
    onHover,
    pickable: Boolean(onHover || onClick),
  };
}

const percentiles = {
  p1: 0.01,
  p5: 0.05,
  p95: 0.95,
  p99: 0.99,
};

/* Supported d3-array functions */
const d3functions: Record<string, any> = {
  sum: d3sum,
  min: d3min,
  max: d3max,
  mean: d3mean,
  median: d3median,
  variance: d3variance,
  deviation: d3deviation,
};

/* Get a stat function that operates on arrays, aligns with control=js_agg_function  */
export function getAggFunc(
  type = 'sum',
  accessor: ((object: any) => number | undefined) | null = null,
) {
  if (type === 'count') {
    return (arr: number[]) => arr.length;
  }

  // The d3-array helpers are called with either raw values or objects plus an
  // accessor, so the element type is only known at the call sites below.
  let d3func: (
    iterable: JsonObject[],
    accessor?: (object: JsonObject) => number | undefined,
  ) => number[] | number | undefined;

  if (type in percentiles) {
    d3func = (arr, acc) => {
      let sortedArr;
      if (accessor) {
        sortedArr = arr
          .slice()
          .sort((o1, o2) => d3ascending(accessor(o1), accessor(o2)));
      } else {
        // Without an accessor the array holds raw comparable values rather
        // than objects.
        sortedArr = (arr as unknown as number[]).slice().sort(d3ascending) as
          unknown as JsonObject[];
      }

      return d3quantile(
        sortedArr,
        percentiles[type as keyof typeof percentiles],
        acc ?? ((value: JsonObject) => value as unknown as number),
      );
    };
  } else if (type in d3functions) {
    d3func = d3functions[type];
  } else {
    throw new Error(`Unsupported aggregation type: ${type}`);
  }

  if (!accessor) {
    return (arr: number[]) => d3func(arr as unknown as JsonObject[]);
  }

  return (arr: number[]) =>
    d3func(arr.map(x => accessor(x)) as unknown as JsonObject[]);
}

export const getColorForBreakpoints = (
  aggFunc: (arr: number[]) => number | number[] | undefined,
  point: number[],
  colorBreakpoints: ColorBreakpointType[],
) => {
  const aggResult = aggFunc(point);

  if (aggResult === undefined) return undefined;

  if (Array.isArray(aggResult)) return undefined;

  const breapointForPoint = colorBreakpoints.findIndex(
    breakpoint =>
      aggResult >= breakpoint.minValue && aggResult <= breakpoint.maxValue,
  );

  return breapointForPoint + 1;
};

export const getColorRange = ({
  colorSchemeType,
  fixedColor,
  colorBreakpoints,
  colorScale,
  defaultBreakpointsColor,
}: {
  colorSchemeType: ColorSchemeType;
  defaultBreakpointsColor: { r: number; g: number; b: number; a: number };
  fixedColor?: { r: number; g: number; b: number; a: number };
  colorBreakpoints?: ColorBreakpointType[];
  colorScale?: CategoricalColorScale | ScaleLinear<string, string>;
}) => {
  let colorRange: Color[] | undefined;
  switch (colorSchemeType) {
    case COLOR_SCHEME_TYPES.linear_palette:
    case COLOR_SCHEME_TYPES.categorical_palette: {
      colorRange = colorScale?.range().map(color => hexToRGB(color)) as Color[];
      break;
    }
    case COLOR_SCHEME_TYPES.color_breakpoints: {
      const defaultColorArray: Color = defaultBreakpointsColor
        ? [
            defaultBreakpointsColor.r,
            defaultBreakpointsColor.g,
            defaultBreakpointsColor.b,
            defaultBreakpointsColor.a * 255,
          ]
        : [
            DEFAULT_DECKGL_COLOR.r,
            DEFAULT_DECKGL_COLOR.g,
            DEFAULT_DECKGL_COLOR.b,
            DEFAULT_DECKGL_COLOR.a * 255,
          ];

      colorRange = colorBreakpoints?.map(
        (colorBreakpoint: ColorBreakpointType) =>
          colorBreakpoint.color
            ? [
                colorBreakpoint.color.r,
                colorBreakpoint.color.g,
                colorBreakpoint.color.b,
                colorBreakpoint.color.a * 255,
              ]
            : defaultColorArray,
      );
      colorRange?.unshift(defaultColorArray);

      break;
    }
    default: {
      const color = fixedColor || {
        r: DEFAULT_DECKGL_COLOR.r,
        g: DEFAULT_DECKGL_COLOR.g,
        b: DEFAULT_DECKGL_COLOR.b,
        a: DEFAULT_DECKGL_COLOR.a,
      };

      colorRange = [[color.r, color.g, color.b, color.a * 255]];
    }
  }

  return colorRange;
};

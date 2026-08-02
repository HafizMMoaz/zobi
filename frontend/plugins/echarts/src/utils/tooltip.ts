import type { CallbackDataParams } from 'echarts/types/src/util/types';
import {
  QueryFormColumn,
  QueryFormMetric,
  getColumnLabel,
  getMetricLabel,
} from '@zobi.dev/core';
import { TOOLTIP_OVERFLOW_MARGIN, TOOLTIP_POINTER_MARGIN } from '../constants';
import { Refs } from '../types';

export function getDefaultTooltip(refs: Refs) {
  return {
    appendToBody:
      typeof document !== 'undefined' ? !document.fullscreenElement : true,
    borderColor: 'transparent',
    // CSS hack applied on this class to resolve https://github.com/HafizMMoaz/zobi/issues/30058
    className: 'echarts-tooltip',
    // Only the mouse position and the content size are used. The remaining
    // arguments are typed loosely because echarts ships two declaration copies
    // whose element types do not unify, and naming either one here makes the
    // callback unassignable to the other.
    position: (
      canvasMousePos: [number, number],
      params: CallbackDataParams | CallbackDataParams[],
      tooltipDom: unknown,
      rect: unknown,
      sizes: { contentSize: [number, number]; viewSize: [number, number] },
    ) => {
      // algorithm partially based on this snippet:
      // https://github.com/HafizMMoaz/echarts/issues/5004#issuecomment-559668309

      // The chart canvas position
      const divRect = refs.divRef?.current?.getBoundingClientRect();

      // The mouse coordinates relative to the whole window
      // The first parameter to the position function is the mouse position relative to the canvas
      const mouseX = canvasMousePos[0] + (divRect?.x || 0);
      const mouseY = canvasMousePos[1] + (divRect?.y || 0);

      // The width and height of the tooltip dom element
      const tooltipWidth = sizes.contentSize[0];
      const tooltipHeight = sizes.contentSize[1];

      // Start by placing the tooltip top and right relative to the mouse position
      let xPos = mouseX + TOOLTIP_POINTER_MARGIN;
      let yPos = mouseY - TOOLTIP_POINTER_MARGIN - tooltipHeight;

      // The tooltip is overflowing past the right edge of the window
      if (xPos + tooltipWidth >= document.documentElement.clientWidth) {
        // Attempt to place the tooltip to the left of the mouse position
        xPos = mouseX - TOOLTIP_POINTER_MARGIN - tooltipWidth;

        // The tooltip is overflowing past the left edge of the window
        if (xPos <= 0)
          // Place the tooltip a fixed distance from the left edge of the window
          xPos = TOOLTIP_OVERFLOW_MARGIN;
      }

      // The tooltip is overflowing past the top edge of the window
      if (yPos <= 0) {
        // Attempt to place the tooltip to the bottom of the mouse position
        yPos = mouseY + TOOLTIP_POINTER_MARGIN;

        // The tooltip is overflowing past the bottom edge of the window
        if (yPos + tooltipHeight >= document.documentElement.clientHeight)
          // Place the tooltip a fixed distance from the top edge of the window
          yPos = TOOLTIP_OVERFLOW_MARGIN;
      }

      // Return the position (converted back to a relative position on the canvas)
      return [xPos - (divRect?.x || 0), yPos - (divRect?.y || 0)];
    },
  };
}

export function getTooltipLabels({
  tooltipMetrics,
  tooltipColumns,
}: {
  tooltipMetrics?: QueryFormMetric[];
  tooltipColumns?: QueryFormColumn[];
}) {
  return [
    ...(tooltipMetrics ?? []).map(v => getMetricLabel(v)),
    ...(tooltipColumns ?? []).map(v => getColumnLabel(v)),
  ];
}

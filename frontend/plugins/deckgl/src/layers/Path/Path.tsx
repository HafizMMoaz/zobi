/* eslint-disable react/no-array-index-key */
import { PathLayer } from '@deck.gl/layers';
import { JsonObject, QueryFormData } from '@zobi.dev/core';
import { commonLayerProps } from '../common';
import sandboxedEval from '../../utils/sandbox';
import { GetLayerType, createDeckGLComponent } from '../../factory';
import { Point } from '../../types';
import {
  createTooltipContent,
  CommonTooltipRows,
} from '../../utilities/tooltipUtils';
import { HIGHLIGHT_COLOR_ARRAY } from '../../utils';

function setTooltipContent(formData: QueryFormData) {
  const defaultTooltipGenerator = (o: JsonObject) => (
    <div className="deckgl-tooltip">
      {CommonTooltipRows.position(o)}
      {CommonTooltipRows.category(o)}
    </div>
  );

  return createTooltipContent(formData, defaultTooltipGenerator);
}

export const getLayer: GetLayerType<PathLayer> = function ({
  formData,
  payload,
  onContextMenu,
  filterState,
  setDataMask,
  setTooltip,
  emitCrossFilters,
}) {
  const fd = formData;
  const c = fd.color_picker;
  const fixedColor = [c.r, c.g, c.b, 255 * c.a];
  let data = payload.data.features.map((feature: JsonObject) => ({
    ...feature,
    path: feature.path,
    width: fd.line_width,
    color: fixedColor,
  }));

  if (fd.js_data_mutator) {
    const jsFnMutator = sandboxedEval(fd.js_data_mutator);
    data = jsFnMutator(data);
  }

  return new PathLayer({
    id: `path-layer-${fd.slice_id}` as const,
    getColor: (d: any) => d.color,
    getPath: (d: any) => d.path,
    getWidth: (d: any) => d.width,
    data,
    rounded: true,
    widthScale: 1,
    widthUnits: fd.line_width_unit,
    ...commonLayerProps({
      formData: fd,
      setTooltip,
      setTooltipContent: setTooltipContent(fd),
      setDataMask,
      filterState,
      onContextMenu,
      emitCrossFilters,
    }),
    opacity: filterState?.value ? 0.3 : 1,
  });
};

export function getPoints(data: JsonObject[]) {
  let points: Point[] = [];
  data.forEach(d => {
    points = points.concat(d.path);
  });

  return points;
}

export const getHighlightLayer: GetLayerType<PathLayer> = function ({
  formData,
  payload,
  filterState,
}) {
  const fd = formData;
  const fixedColor = HIGHLIGHT_COLOR_ARRAY;
  let data = payload.data.features.map((feature: JsonObject) => ({
    ...feature,
    path: feature.path,
    width: fd.line_width,
    color: fixedColor,
  }));

  if (fd.js_data_mutator) {
    const jsFnMutator = sandboxedEval(fd.js_data_mutator);
    data = jsFnMutator(data);
  }

  const filteredData = data.filter(
    (d: JsonObject) =>
      JSON.stringify(d.path).replaceAll(' ', '') === filterState?.value?.[0],
  );

  return new PathLayer({
    id: `path-highlight-layer-${fd.slice_id}` as const,
    getColor: () => HIGHLIGHT_COLOR_ARRAY,
    getPath: (d: any) => d.path,
    getWidth: (d: any) => d.width,
    data: filteredData,
    rounded: true,
    widthScale: 1,
    widthUnits: fd.line_width_unit,
  });
};

export default createDeckGLComponent(getLayer, getPoints, getHighlightLayer);

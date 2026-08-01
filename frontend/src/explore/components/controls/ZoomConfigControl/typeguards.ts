import {
  ZoomConfigs,
  ZoomConfigsFixed,
  ZoomConfigsLinear,
  ZoomConfigsExp,
} from './types';

export const isZoomConfigsFixed = (
  zoomConfigs: ZoomConfigs,
): zoomConfigs is ZoomConfigsFixed => zoomConfigs.type === 'FIXED';

export const isZoomConfigsLinear = (
  zoomConfigs: ZoomConfigs,
): zoomConfigs is ZoomConfigsLinear => zoomConfigs.type === 'LINEAR';

export const isZoomConfigsExp = (
  zoomConfigs: ZoomConfigs,
): zoomConfigs is ZoomConfigsExp => zoomConfigs.type === 'EXP';

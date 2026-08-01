import { LayerConf, WfsLayerConf, WmsLayerConf, XyzLayerConf } from './types';

export const isWmsLayerConf = (
  layerConf: LayerConf,
): layerConf is WmsLayerConf => layerConf.type === 'WMS';

export const isWfsLayerConf = (
  layerConf: LayerConf,
): layerConf is WfsLayerConf => layerConf.type === 'WFS';

export const isXyzLayerConf = (
  layerConf: LayerConf,
): layerConf is XyzLayerConf => layerConf.type === 'XYZ';

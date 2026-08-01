
import { WfsLayerConf } from './types';

/**
 * Get the available versions of WFS and WMS.
 *
 * @returns the versions
 */
export const getServiceVersions = () => ({
  WMS: ['1.3.0', '1.1.1'],
  WFS: ['2.0.2', '2.0.0', '1.1.0'],
});

/**
 * Checks if all required WFS params are provided.
 *
 * @param layerConf The config to check
 * @returns True, if all required params are provided. False, otherwise.
 */
export const hasAllRequiredWfsParams = (layerConf: WfsLayerConf) =>
  layerConf.url && layerConf.version && layerConf.typeName;

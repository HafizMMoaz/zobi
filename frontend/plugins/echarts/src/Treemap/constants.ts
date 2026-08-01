
import { TreePathInfo } from '../types';

export const COLOR_SATURATION = [0.7, 0.4];
export const LABEL_FONTSIZE = 11;
export const BORDER_WIDTH = 2;
export const GAP_WIDTH = 2;

export const extractTreePathInfo = (
  treePathInfo: TreePathInfo[] | undefined,
) => {
  const treePath = (treePathInfo ?? [])
    .map(pathInfo => pathInfo?.name || '')
    .filter(path => path !== '');

  // the 1st tree path is metric label
  const metricLabel = treePath.shift() || '';
  return { metricLabel, treePath };
};

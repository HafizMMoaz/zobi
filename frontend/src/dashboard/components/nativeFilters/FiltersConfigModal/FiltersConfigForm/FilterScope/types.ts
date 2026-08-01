
import { ReactNode } from 'react';

/** UI Ant tree type */
export type TreeItem = {
  children: TreeItem[];
  key: string;
  title: ReactNode;
  nodeType?: 'CHART' | 'TAB' | 'ROOT' | 'DECKGL_LAYER';
  chartId?: number;
  layerType?: string;
};

export type BuildTreeLeafTitle = (
  label: string,
  hasTooltip: boolean,
  tooltipTitle?: string,
  isDeckMultiChart?: boolean,
) => ReactNode;

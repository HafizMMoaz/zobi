import type { ZobiTheme } from '@zobi.dev/extension-api/theme';
import { LegendOrientation, LegendType } from '../types';
import { getLegendLayoutResult, LegendLayoutResult } from './series';

type LegendDataItem =
  | string
  | number
  | null
  | undefined
  | { name?: string | number | null };

export type ResolvedLegendLayout = {
  effectiveLegendMargin?: string | number | null;
  effectiveLegendType: LegendType;
  legendLayout: LegendLayoutResult;
};

export function resolveLegendLayout(args: {
  availableHeight?: number;
  availableWidth?: number;
  chartHeight: number;
  chartWidth: number;
  legendItems?: LegendDataItem[];
  legendMargin?: string | number | null;
  orientation: LegendOrientation;
  show: boolean;
  showSelectors?: boolean;
  theme: ZobiTheme;
  type: LegendType;
}): ResolvedLegendLayout {
  const legendLayout = getLegendLayoutResult(args);

  return {
    effectiveLegendMargin: legendLayout.effectiveMargin ?? args.legendMargin,
    effectiveLegendType: legendLayout.effectiveType,
    legendLayout,
  };
}

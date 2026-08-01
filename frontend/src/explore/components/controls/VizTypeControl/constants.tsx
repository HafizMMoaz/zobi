import { ReactElement } from 'react';
import { VizType } from '@zobi.dev/core';
import { css } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { VizMeta } from './types';

// Custom icons for non-featured charts
export const CUSTOM_CHART_ICONS: Record<string, ReactElement> = {
  deck_multi: <Icons.Multiple iconSize="l" viewBox="5 4 15 20" />,
};

export const FEATURED_CHARTS: VizMeta[] = [
  {
    name: VizType.Line,
    icon: <Icons.LineChartOutlined iconSize="l" />,
  },
  {
    name: VizType.Bar,
    icon: <Icons.BarChartOutlined iconSize="l" />,
  },
  { name: VizType.Area, icon: <Icons.AreaChartOutlined iconSize="l" /> },
  { name: VizType.Table, icon: <Icons.TableOutlined iconSize="l" /> },
  {
    name: VizType.BigNumberTotal,
    icon: (
      <Icons.BigNumberChartTile
        iconSize="l"
        viewBox="0 0 16 14"
        css={css`
          path {
            fill: currentColor;
          }
        `}
      />
    ),
  },
  { name: VizType.Pie, icon: <Icons.PieChartOutlined iconSize="l" /> },
];

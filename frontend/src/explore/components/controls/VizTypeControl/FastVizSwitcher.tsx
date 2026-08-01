import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { t } from '@zobi/core/translation';
import { css, ZobiTheme } from '@zobi/core/theme';
import { Flex, Icons } from '@zobi-ui/core/components';
import { getChartKey } from 'src/explore/exploreUtils';
import { ExplorePageState } from 'src/explore/types';
import { FastVizSwitcherProps } from './types';
import { VizTile } from './VizTile';
import { FEATURED_CHARTS, CUSTOM_CHART_ICONS } from './constants';

export const antdIconProps = {
  iconSize: 'l' as const,
  css: (theme: ZobiTheme) => css`
    padding: ${theme.sizeUnit}px;
    & > * {
      line-height: 0;
    }
  `,
};

export const FastVizSwitcher = memo(
  ({ currentSelection, onChange }: FastVizSwitcherProps) => {
    const currentViz = useSelector<ExplorePageState, string | undefined>(
      state =>
        state.charts?.[getChartKey(state.explore)]?.latestQueryFormData
          ?.viz_type,
    );
    const vizTiles = useMemo(() => {
      const vizTiles = [...FEATURED_CHARTS];
      if (
        currentSelection &&
        FEATURED_CHARTS.every(
          featuredVizMeta => featuredVizMeta.name !== currentSelection,
        ) &&
        currentSelection !== currentViz
      ) {
        vizTiles.unshift({
          name: currentSelection,
          icon: CUSTOM_CHART_ICONS[currentSelection] || (
            <Icons.MonitorOutlined {...antdIconProps} aria-label={t('Chart')} />
          ),
        });
      }
      if (
        currentViz &&
        FEATURED_CHARTS.every(
          featuredVizMeta => featuredVizMeta.name !== currentViz,
        )
      ) {
        vizTiles.unshift({
          name: currentViz,
          icon: CUSTOM_CHART_ICONS[currentViz] || (
            <Icons.CheckSquareOutlined
              {...antdIconProps}
              aria-label="check-square"
            />
          ),
        });
      }
      return vizTiles;
    }, [currentSelection, currentViz]);

    return (
      <Flex justify="space-between" gap={4} data-test="fast-viz-switcher">
        {vizTiles.map(vizMeta => (
          <VizTile
            vizMeta={vizMeta}
            isActive={currentSelection === vizMeta.name}
            isRendered={currentViz === vizMeta.name}
            onTileClick={onChange}
            key={vizMeta.name}
          />
        ))}
      </Flex>
    );
  },
);

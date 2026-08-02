import { CSSProperties, ReactNode, memo, useMemo } from 'react';
import { ParentSize } from '@visx/responsive';

type Props = {
  className?: string;
  debounceTime?: number;
  width?: number | string;
  height?: number | string;
  legendJustifyContent?: 'center' | 'flex-start' | 'flex-end';
  position?: 'top' | 'left' | 'bottom' | 'right';
  renderChart: (dim: { width: number; height: number }) => ReactNode;
  renderLegend?: (params: { direction: string }) => ReactNode;
};

const LEGEND_STYLE_BASE: CSSProperties = {
  display: 'flex',
  flexGrow: 0,
  flexShrink: 0,
  order: -1,
};

const CHART_STYLE_BASE: CSSProperties = {
  flexBasis: 'auto',
  flexGrow: 1,
  flexShrink: 1,
  position: 'relative',
};

function getContainerDirection(
  position: Props['position'],
): CSSProperties['flexDirection'] {
  if (position === 'left') {
    return 'row';
  }
  if (position === 'right') {
    return 'row-reverse';
  }
  if (position === 'bottom') {
    return 'column-reverse';
  }

  return 'column';
}

function getLegendJustifyContent(
  legendJustifyContent: Props['legendJustifyContent'],
  position: Props['position'],
) {
  if (legendJustifyContent) {
    return legendJustifyContent;
  }

  if (position === 'left' || position === 'right') {
    return 'flex-start';
  }

  return 'flex-end';
}

function WithLegend({
  className = '',
  debounceTime,
  width = 'auto',
  height = 'auto',
  legendJustifyContent,
  position = 'top',
  renderChart,
  renderLegend,
}: Props) {
  const isHorizontal = position === 'left' || position === 'right';

  const style: CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexDirection: getContainerDirection(position),
      height,
      width,
    }),
    [position, height, width],
  );

  const chartStyle: CSSProperties = useMemo(() => {
    const baseStyle = { ...CHART_STYLE_BASE };
    if (isHorizontal) {
      baseStyle.width = 0;
    } else {
      baseStyle.height = 0;
    }
    return baseStyle;
  }, [isHorizontal]);

  const legendDirection = isHorizontal ? 'column' : 'row';
  const legendStyle: CSSProperties = useMemo(
    () => ({
      ...LEGEND_STYLE_BASE,
      flexDirection: legendDirection,
      justifyContent: getLegendJustifyContent(legendJustifyContent, position),
    }),
    [legendDirection, legendJustifyContent, position],
  );

  return (
    <div className={`with-legend ${className}`} style={style}>
      {renderLegend && (
        <div className="legend-container" style={legendStyle}>
          {renderLegend({
            // Pass flexDirection for @vx/legend to arrange legend items
            direction: legendDirection,
          })}
        </div>
      )}
      <div className="main-container" style={chartStyle}>
        <ParentSize debounceTime={debounceTime}>
          {(parent: { width: number; height: number }) =>
            parent.width > 0 && parent.height > 0
              ? // Only render when necessary
                renderChart(parent)
              : null
          }
        </ParentSize>
      </div>
    </div>
  );
}

export default memo(WithLegend);

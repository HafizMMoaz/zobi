/* eslint-disable react/jsx-sort-default-props, react/sort-prop-types */
import { PureComponent } from 'react';
import { extent as d3Extent } from 'd3-array';
import { ensureIsArray } from '@zobi-ui/core';
import { styled } from '@zobi/core/theme';
import HorizonRow, { DEFAULT_COLORS } from './HorizonRow';

interface DataValue {
  y: number;
}

interface DataSeries {
  key: string[];
  values: DataValue[];
}

interface HorizonChartProps {
  className?: string;
  width?: number;
  height?: number;
  seriesHeight?: number;
  data: DataSeries[];
  bands?: number;
  colors?: string[];
  colorScale?: string;
  mode?: string;
  offsetX?: number;
}

const defaultProps: Partial<HorizonChartProps> = {
  className: '',
  width: 800,
  height: 600,
  seriesHeight: 20,
  bands: Math.floor(DEFAULT_COLORS.length / 2),
  colors: DEFAULT_COLORS,
  colorScale: 'series',
  mode: 'offset',
  offsetX: 0,
};

const StyledDiv = styled.div`
  ${({ theme }) => `
    .zobi-legacy-chart-horizon {
      overflow: auto;
      position: relative;
    }

    .zobi-legacy-chart-horizon .horizon-row {
      border-bottom: solid 1px ${theme.colorBorderSecondary};
      border-top: 0;
      padding: 0;
      margin: 0;
    }

    .zobi-legacy-chart-horizon .horizon-row span.title {
      position: absolute;
      color: ${theme.colorText};
      font-size: ${theme.fontSizeSM}px;
      margin: 0;
    }
  `}
`;

class HorizonChart extends PureComponent<HorizonChartProps> {
  static defaultProps = defaultProps;

  render() {
    const {
      className,
      width,
      height,
      data,
      seriesHeight,
      bands,
      colors,
      colorScale,
      mode,
      offsetX,
    } = this.props;

    let yDomain: [number, number] | undefined;
    if (colorScale === 'overall') {
      const allValues = data.reduce<DataValue[]>(
        (acc, current) => acc.concat(current.values),
        [],
      );
      const rawExtent = d3Extent(allValues, d => d.y);
      // Only set yDomain if we have valid min and max values
      if (rawExtent[0] != null && rawExtent[1] != null) {
        yDomain = [rawExtent[0], rawExtent[1]];
      }
    }

    return (
      <StyledDiv>
        <div
          className={`zobi-legacy-chart-horizon ${className}`}
          style={{ height }}
        >
          {data.map(row => (
            <HorizonRow
              key={row.key.join(',')}
              width={width}
              height={seriesHeight}
              title={ensureIsArray(row.key).join(', ')}
              data={row.values}
              bands={bands}
              colors={colors}
              colorScale={colorScale}
              mode={mode}
              offsetX={offsetX}
              yDomain={yDomain}
            />
          ))}
        </div>
      </StyledDiv>
    );
  }
}

export default HorizonChart;

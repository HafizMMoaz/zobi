import { type ComponentProps } from 'react';
import { reactify, addAlpha } from '@zobi.dev/core';
import { styled } from '@zobi.dev/extension-api/theme';
import Component from './ParallelCoordinates';

const ReactComponent = reactify(Component);

interface ParallelCoordinatesWrapperProps {
  className?: string;
  [key: string]: unknown;
}

const ParallelCoordinates = ({
  className,
  ...otherProps
}: ParallelCoordinatesWrapperProps) => (
  <div className={className}>
    {/* Props are injected by the chart framework at runtime */}
    <ReactComponent
      {...(otherProps as unknown as ComponentProps<typeof ReactComponent>)}
    />
  </div>
);

export default styled(ParallelCoordinates)`
  ${({ theme }) => `
    .zobi-legacy-chart-parallel-coordinates {
      div.grid {
        overflow: auto;
        div.row {
          &:hover {
            background-color: ${theme.colorBgTextHover};
          }
        }
      }
    }
    .parcoords svg,
    .parcoords canvas {
      font-size: ${theme.fontSizeSM}px;
      position: absolute;
    }
    .parcoords > canvas {
      pointer-events: none;
    }

    .parcoords text.label {
      font: 100%;
      font-size: ${theme.fontSizeSM}px;
      fill: ${theme.colorText};
      cursor: drag;
    }
    .parcoords rect.background {
      fill: transparent;
    }
    .parcoords rect.background:hover {
      fill: ${addAlpha(theme.colorBorder, 0.2)};
    }
    .parcoords .resize rect {
      fill: ${addAlpha(theme.colorText, 0.1)};
    }
    .parcoords rect.extent {
      fill: ${addAlpha(theme.colorBgContainer, 0.25)};
      stroke: ${addAlpha(theme.colorText, 0.6)};
    }
    .parcoords .axis line,
    .parcoords .axis path {
      fill: none;
      stroke: ${theme.colorText};
      shape-rendering: crispEdges;
    }
    .parcoords .axis text {
      fill: ${theme.colorText};
    }
    .parcoords canvas {
      opacity: 1;
      -moz-transition: opacity 0.3s;
      -webkit-transition: opacity 0.3s;
      -o-transition: opacity 0.3s;
    }
    .parcoords canvas.faded {
      opacity: 35%;
    }
    .parcoords {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      background-color: ${theme.colorBgContainer};
    }

    /* data table styles */
    .parcoords .row,
    .parcoords .header {
      clear: left;
      font-size: ${theme.fontSizeSM}px;
      line-height: 18px;
      height: 18px;
      margin: 0px;
    }
    .parcoords .row:nth-of-type(odd) {
      background: ${addAlpha(theme.colorText, 0.05)};
    }
    .parcoords .header {
      font-weight: ${theme.fontWeightStrong};
    }
    .parcoords .cell {
      float: left;
      overflow: hidden;
      white-space: nowrap;
      width: 100px;
      height: 18px;
    }
    .parcoords .col-0 {
      width: 180px;
    }
  `}
`;

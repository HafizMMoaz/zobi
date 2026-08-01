import { reactify } from '@zobi-ui/core';
import { styled } from '@zobi/core/theme';
import Component from './Partition';

// Type-erase the render function to allow flexible prop spreading in the wrapper.
// The Partition render function has typed props, but the wrapper passes props via spread
// which TypeScript cannot verify at compile time. Props are validated at runtime.
const ReactComponent = reactify(
  Component as unknown as (
    container: HTMLDivElement,
    props: Record<string, unknown>,
  ) => void,
);

interface PartitionWrapperProps {
  className?: string;
  [key: string]: unknown;
}

const Partition = ({ className, ...otherProps }: PartitionWrapperProps) => (
  <div className={className}>
    <ReactComponent {...otherProps} />
  </div>
);

export default styled(Partition)`
  ${({ theme }) => `
    .zobi-legacy-chart-partition {
      position: relative;
    }

    .zobi-legacy-chart-partition .chart {
      display: block;
      margin: auto;
      font-size: ${theme.fontSizeSM}px;
    }

    .zobi-legacy-chart-partition rect {
      stroke: ${theme.colorBorderSecondary};
      fill: ${theme.colorBgLayout};
      fill-opacity: 80%;
      transition: fill-opacity 180ms linear;
      cursor: pointer;
    }

    .zobi-legacy-chart-partition rect:hover {
      fill-opacity: 1;
    }

    .zobi-legacy-chart-partition g text {
      font-weight: ${theme.fontWeightStrong};
      fill: ${theme.colorText};
    }

    .zobi-legacy-chart-partition g:hover text {
      fill: ${theme.colorTextHeading};
    }

    .zobi-legacy-chart-partition .partition-tooltip {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      padding: ${theme.sizeUnit}px;
      pointer-events: none;
      background-color: ${theme.colorBgElevated};
      border-radius: ${theme.borderRadius}px;
    }

    .partition-tooltip td {
      padding-left: ${theme.sizeUnit}px;
      font-size: ${theme.fontSizeSM}px;
      color: ${theme.colorTextSecondary};
    }
  `}
`;

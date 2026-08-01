import { reactify } from '@zobi-ui/core';
import { styled } from '@zobi/core/theme';
import Component from './CountryMap';

// Type-erase the render function to allow flexible prop spreading in the wrapper.
// The CountryMap render function has typed props, but the wrapper passes props via spread
// which TypeScript cannot verify at compile time. Props are validated at runtime.
const ReactComponent = reactify(
  Component as unknown as (
    container: HTMLDivElement,
    props: Record<string, unknown>,
  ) => void,
);

interface CountryMapWrapperProps {
  className?: string;
  [key: string]: unknown;
}

const CountryMap = ({
  className = '',
  ...otherProps
}: CountryMapWrapperProps) => (
  <div className={className}>
    <ReactComponent {...otherProps} />
  </div>
);

export default styled(CountryMap)`
  ${({ theme }) => `
    .zobi-legacy-chart-country-map svg {
      background-color: ${theme.colorBgContainer};
    }

    .zobi-legacy-chart-country-map {
      position: relative;
    }

    .zobi-legacy-chart-country-map .background {
      fill: ${theme.colorBgContainer};
      pointer-events: all;
    }

    .zobi-legacy-chart-country-map .hover-popup {
      position: absolute;
      color: ${theme.colorTextSecondary};
      display: none;
      padding: 4px;
      border-radius: 1px;
      background-color: ${theme.colorBgElevated};
      box-shadow: ${theme.boxShadow};
      font-size: 12px;
      border: 1px solid ${theme.colorBorder};
      z-index: 10001;
    }

    .zobi-legacy-chart-country-map .map-layer {
      fill: ${theme.colorBgContainer};
      stroke: ${theme.colorBorderSecondary};
      pointer-events: all;
    }

    .zobi-legacy-chart-country-map .effect-layer {
      pointer-events: none;
    }

    .zobi-legacy-chart-country-map path.region {
      cursor: pointer;
      stroke: ${theme.colorSplit};
    }
  `}
`;

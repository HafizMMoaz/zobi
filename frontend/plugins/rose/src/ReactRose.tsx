import { reactify } from '@zobi.dev/core';
import { styled, css } from '@zobi.dev/extension-api/theme';
import { Global } from '@emotion/react';
import Component from './Rose';

// Type-erase the render function to allow flexible prop spreading in the wrapper.
// The Rose render function has typed props, but the wrapper passes props via spread
// which TypeScript cannot verify at compile time. Props are validated at runtime.
const ReactComponent = reactify(
  Component as unknown as (
    container: HTMLDivElement,
    props: Record<string, unknown>,
  ) => void,
);

interface RoseWrapperProps {
  className?: string;
  [key: string]: unknown;
}

const Rose = ({ className, ...otherProps }: RoseWrapperProps) => (
  <div className={className}>
    <Global
      styles={theme => css`
        .tooltip {
          line-height: 1;
          padding: ${theme.sizeUnit * 3}px;
          background: ${theme.colorBgElevated};
          color: ${theme.colorText};
          border-radius: 4px;
          pointer-events: none;
          z-index: 1000;
          font-size: ${theme.fontSizeSM}px;
        }
      `}
    />
    <ReactComponent {...otherProps} />
  </div>
);

export default styled(Rose)`
  ${({ theme }) => `
    .zobi-legacy-chart-rose path {
        transition: fill-opacity 180ms linear;
        stroke: ${theme.colorBorder};
        stroke-width: 1px;
        stroke-opacity: 1;
        fill-opacity: 0.75;
    }

    .zobi-legacy-chart-rose text {
        font-size: ${theme.fontSizeSM}px;
        font-family: ${theme.fontFamily};
        pointer-events: none;
    }

    .zobi-legacy-chart-rose .clickable path {
        cursor: pointer;
    }

    .zobi-legacy-chart-rose .hover path {
        fill-opacity: 1;
    }

    .nv-legend .nv-series {
        cursor: pointer;
    }
  `}
`;

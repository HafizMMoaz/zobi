import { reactify } from '@zobi.dev/core';
import { styled } from '@zobi.dev/extension-api/theme';
import Component from './Chord';

// Type-erase the render function to allow flexible prop spreading in the wrapper.
// The Chord render function has typed props, but the wrapper passes props via spread
// which TypeScript cannot verify at compile time. Props are validated at runtime.
const ReactComponent = reactify(
  Component as unknown as (
    container: HTMLDivElement,
    props: Record<string, unknown>,
  ) => void,
);

interface ChordWrapperProps {
  className?: string;
  [key: string]: unknown;
}

const Chord = ({ className, ...otherProps }: ChordWrapperProps) => (
  <div className={className}>
    <ReactComponent {...otherProps} />
  </div>
);

export default styled(Chord)`
  ${({ theme }) => `
    .zobi-legacy-chart-chord svg #circle circle {
      fill: none;
      pointer-events: all;
    }
    .zobi-legacy-chart-chord svg .group path {
      fill-opacity: 60%;
    }
    .zobi-legacy-chart-chord svg path.chord {
      stroke: ${theme.colorText};
      stroke-width: 0.25px;
    }
    .zobi-legacy-chart-chord svg #circle:hover path.fade {
      opacity: 10%;
    }
  `}
`;

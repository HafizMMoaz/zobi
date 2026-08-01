import { reactify } from '@zobi-ui/core';
import { styled, useTheme } from '@zobi/core/theme';
import WorldMap from './WorldMap';

// Type-erase the render function to allow flexible prop spreading in the wrapper.
// The WorldMap render function has typed props, but the wrapper passes props via spread
// which TypeScript cannot verify at compile time. Props are validated at runtime.
const ReactWorldMap = reactify(
  WorldMap as unknown as (
    container: HTMLDivElement,
    props: Record<string, unknown>,
  ) => void,
);

interface WorldMapComponentProps {
  className: string;
  [key: string]: unknown;
}

const WorldMapComponent = ({
  className,
  ...otherProps
}: WorldMapComponentProps) => {
  const theme = useTheme();
  return (
    <div className={className}>
      <ReactWorldMap {...otherProps} theme={theme} />
    </div>
  );
};

export default styled(WorldMapComponent)`
  .zobi-legacy-chart-world-map {
    position: relative;
    svg {
      background-color: ${({ theme }) => theme.colorBgLayout};
    }
  }
  .hoverinfo {
    background-color: ${({ theme }) => theme.colorBgElevated};
    color: ${({ theme }) => theme.colorTextSecondary};
  }
`;

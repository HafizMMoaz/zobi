import { createRef, useState } from 'react';
import { styled, useTheme } from '@zobi.dev/extension-api/theme';
import OlMap from 'ol/Map';
import {
  CartodiagramPluginProps,
  CartodiagramPluginStylesProps,
} from './types';

import OlChartMap from './components/OlChartMap';

import 'ol/ol.css';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @zobi.dev/core. For variables available, please visit
// https://github.com/zobi/zobi-ui/blob/master/packages/core/src/style/index.ts

const Styles = styled.div<CartodiagramPluginStylesProps>`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
`;

export default function CartodiagramPlugin(props: CartodiagramPluginProps) {
  const { height, width } = props;
  const theme = useTheme();

  const rootElem = createRef<HTMLDivElement>();

  const [mapId] = useState(
    `cartodiagram-plugin-${Math.floor(Math.random() * 1000000)}`,
  );
  const [olMap] = useState(new OlMap({}));

  return (
    <Styles ref={rootElem} height={height} width={width} theme={theme}>
      <OlChartMap mapId={mapId} olMap={olMap} {...props} />
    </Styles>
  );
}

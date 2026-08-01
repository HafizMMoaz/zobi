import { createContext, useContext, useState, FC } from 'react';

import { URL_PARAMS } from 'src/constants';
import { getUrlParam } from 'src/utils/urlUtils';

interface UiConfigType {
  hideTitle: boolean;
  hideTab: boolean;
  hideNav: boolean;
  hideChartControls: boolean;
  // embedded-sdk specific
  emitDataMasks: boolean; // emit data masks to the parent window
  showRowLimitWarning: boolean; // show the row limit warning
}
interface EmbeddedUiConfigProviderProps {
  children: JSX.Element;
}

export const UiConfigContext = createContext<UiConfigType>({
  hideTitle: false,
  hideTab: false,
  hideNav: false,
  hideChartControls: false,
  emitDataMasks: false,
  showRowLimitWarning: false,
});

export const useUiConfig = () => useContext(UiConfigContext);

export const EmbeddedUiConfigProvider: FC<EmbeddedUiConfigProviderProps> = ({
  children,
}) => {
  const config = getUrlParam(URL_PARAMS.uiConfig) || 0;
  const [embeddedConfig] = useState({
    hideTitle: (config & 1) !== 0,
    hideTab: (config & 2) !== 0,
    hideNav: (config & 4) !== 0,
    hideChartControls: (config & 8) !== 0,
    emitDataMasks: (config & 16) !== 0,
    showRowLimitWarning: (config & 32) !== 0,
  });

  return (
    <UiConfigContext.Provider value={embeddedConfig}>
      {children}
    </UiConfigContext.Provider>
  );
};

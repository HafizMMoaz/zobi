import { configureStore } from '@reduxjs/toolkit';
import { getChartComponentRegistry } from '@zobi-ui/core';
import { ThemeProvider } from '@zobi/core/theme';
import { FC, useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ChartWrapperProps } from '../types';

export const ChartWrapper: FC<ChartWrapperProps> = ({
  vizType,
  theme,
  height,
  width,
  chartConfig,
  locale,
}) => {
  const [Chart, setChart] = useState<any>();

  const getChartFromRegistry = async (vizType: string) => {
    const registry = getChartComponentRegistry();
    const c = await registry.getAsPromise(vizType);
    setChart(() => c);
  };

  useEffect(() => {
    getChartFromRegistry(vizType);
  }, [vizType]);

  // Create a mock store that is needed by
  // eCharts components to access the locale.
  const mockStore = configureStore({
    reducer: (state = { common: { locale } }) => state,
  });

  return (
    <ThemeProvider theme={theme}>
      <ReduxProvider store={mockStore}>
        {Chart === undefined ? (
          <></>
        ) : (
          <Chart {...chartConfig.properties} height={height} width={width} />
        )}
      </ReduxProvider>
    </ThemeProvider>
  );
};

export default ChartWrapper;

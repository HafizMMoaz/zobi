
import { PostProcessingProphet, getXAxisLabel } from '@zobi-ui/core';
import { PostProcessingFactory } from './types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const prophetOperator: PostProcessingFactory<PostProcessingProphet> = (
  formData,
  queryObject,
) => {
  const xAxisLabel = getXAxisLabel(formData);
  if (formData.forecastEnabled && xAxisLabel) {
    return {
      operation: 'prophet',
      options: {
        time_grain: formData.time_grain_sqla,
        periods: parseInt(formData.forecastPeriods, 10),
        confidence_interval: parseFloat(formData.forecastInterval),
        yearly_seasonality: formData.forecastSeasonalityYearly,
        weekly_seasonality: formData.forecastSeasonalityWeekly,
        daily_seasonality: formData.forecastSeasonalityDaily,
        index: xAxisLabel,
      },
    };
  }
  return undefined;
};

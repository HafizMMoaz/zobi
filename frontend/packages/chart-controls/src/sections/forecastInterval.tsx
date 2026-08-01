import { t } from '@zobi.dev/extension-api/translation';
import { legacyValidateInteger, legacyValidateNumber } from '@zobi.dev/core';
import { ControlPanelSectionConfig } from '../types';
import { displayTimeRelatedControls } from '../utils';

export const FORECAST_DEFAULT_DATA = {
  forecastEnabled: false,
  forecastInterval: 0.8,
  forecastPeriods: 10,
  forecastSeasonalityDaily: null,
  forecastSeasonalityWeekly: null,
  forecastSeasonalityYearly: null,
};

export const forecastIntervalControls: ControlPanelSectionConfig = {
  label: t('Predictive Analytics'),
  expanded: false,
  visibility: displayTimeRelatedControls,
  controlSetRows: [
    [
      {
        name: 'forecastEnabled',
        config: {
          type: 'CheckboxControl',
          label: t('Enable forecast'),
          renderTrigger: false,
          default: FORECAST_DEFAULT_DATA.forecastEnabled,
          description: t('Enable forecasting'),
        },
      },
    ],
    [
      {
        name: 'forecastPeriods',
        config: {
          type: 'TextControl',
          label: t('Forecast periods'),
          validators: [legacyValidateInteger],
          default: FORECAST_DEFAULT_DATA.forecastPeriods,
          description: t(
            'How many periods into the future do we want to predict',
          ),
        },
      },
    ],
    [
      {
        name: 'forecastInterval',
        config: {
          type: 'TextControl',
          label: t('Confidence interval'),
          validators: [legacyValidateNumber],
          default: FORECAST_DEFAULT_DATA.forecastInterval,
          description: t(
            'Width of the confidence interval. Should be between 0 and 1',
          ),
        },
      },
    ],
    [
      {
        name: 'forecastSeasonalityYearly',
        config: {
          type: 'SelectControl',
          freeForm: true,
          label: t('Yearly seasonality'),
          choices: [
            [null, t('default')],
            [true, t('Yes')],
            [false, t('No')],
          ],
          default: FORECAST_DEFAULT_DATA.forecastSeasonalityYearly,
          description: t(
            'Should yearly seasonality be applied. An integer value will specify Fourier order of seasonality.',
          ),
        },
      },
    ],
    [
      {
        name: 'forecastSeasonalityWeekly',
        config: {
          type: 'SelectControl',
          freeForm: true,
          label: t('Weekly seasonality'),
          choices: [
            [null, t('default')],
            [true, t('Yes')],
            [false, t('No')],
          ],
          default: FORECAST_DEFAULT_DATA.forecastSeasonalityWeekly,
          description: t(
            'Should weekly seasonality be applied. An integer value will specify Fourier order of seasonality.',
          ),
        },
      },
    ],
    [
      {
        name: 'forecastSeasonalityDaily',
        config: {
          type: 'SelectControl',
          freeForm: true,
          label: t('Daily seasonality'),
          choices: [
            [null, t('default')],
            [true, t('Yes')],
            [false, t('No')],
          ],
          default: FORECAST_DEFAULT_DATA.forecastSeasonalityDaily,
          description: t(
            'Should daily seasonality be applied. An integer value will specify Fourier order of seasonality.',
          ),
        },
      },
    ],
  ],
};

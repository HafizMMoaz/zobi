import { t } from '@zobi.dev/extension-api/translation';
import {
  ControlPanelConfig,
  D3_FORMAT_OPTIONS,
  getStandardizedControls,
  sections,
} from '@zobi.dev/chart-controls';
import {
  lineInterpolation,
  showLegend,
  xAxisLabel,
  bottomMargin,
  xAxisFormat,
  yLogScale,
  yAxisBounds,
  xAxisShowMinmax,
  yAxisShowMinmax,
  yAxisLabel,
  leftMargin,
} from '../NVD3Controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyTimeseriesTime,
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['metric'],
        ['adhoc_filters'],
        [
          {
            name: 'freq',
            config: {
              type: 'SelectControl',
              label: t('Frequency'),
              default: 'W-MON',
              freeForm: true,
              clearable: false,
              choices: [
                ['AS', t('Year (freq=AS)')],
                ['52W-MON', t('52 weeks starting Monday (freq=52W-MON)')],
                ['W-SUN', t('1 week starting Sunday (freq=W-SUN)')],
                ['W-MON', t('1 week starting Monday (freq=W-MON)')],
                ['D', t('Day (freq=D)')],
                ['4W-MON', t('4 weeks (freq=4W-MON)')],
              ],
              description: t(
                `The periodicity over which to pivot time. Users can provide
            "Pandas" offset alias.
            Click on the info bubble for more details on accepted "freq" expressions.`,
              ),
              tooltipOnClick: () => {
                window.open(
                  'https://pandas.pydata.org/pandas-docs/stable/timeseries.html#offset-aliases',
                );
              },
            },
          },
        ],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        [showLegend],
        [lineInterpolation],
        ['color_picker', null],
      ],
    },
    {
      label: t('X Axis'),
      expanded: true,
      controlSetRows: [
        [xAxisLabel],
        [bottomMargin],
        [xAxisShowMinmax],
        [
          {
            name: xAxisFormat.name,
            config: {
              ...xAxisFormat.config,
              default: 'SMART_NUMBER',
              choices: D3_FORMAT_OPTIONS,
            },
          },
        ],
      ],
    },
    {
      label: t('Y Axis'),
      expanded: true,
      controlSetRows: [
        [yAxisLabel],
        [leftMargin],
        [yAxisShowMinmax],
        [yLogScale],
        ['y_axis_format'],
        [yAxisBounds],
      ],
    },
  ],
  controlOverrides: {
    metric: {
      clearable: false,
    },
  },
  formDataOverrides: formData => ({
    ...formData,
    metric: getStandardizedControls().shiftMetric,
  }),
};

export default config;

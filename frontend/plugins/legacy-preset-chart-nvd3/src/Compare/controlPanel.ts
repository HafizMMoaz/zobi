import { t } from '@zobi/core/translation';
import {
  ControlPanelConfig,
  getStandardizedControls,
  sections,
} from '@zobi-ui/chart-controls';
import {
  xAxisLabel,
  yAxisLabel,
  bottomMargin,
  xTicksLayout,
  xAxisFormat,
  yLogScale,
  yAxisBounds,
  xAxisShowMinmax,
  yAxisShowMinmax,
  leftMargin,
  timeSeriesSection,
} from '../NVD3Controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyTimeseriesTime,
    timeSeriesSection[0],
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [['color_scheme']],
    },
    {
      label: t('X Axis'),
      expanded: true,
      controlSetRows: [
        [xAxisLabel, bottomMargin],
        [xTicksLayout, xAxisFormat],
        [xAxisShowMinmax, null],
      ],
    },
    {
      label: t('Y Axis'),
      expanded: true,
      controlSetRows: [
        [yAxisLabel, leftMargin],
        [yAxisShowMinmax, yLogScale],
        ['y_axis_format', yAxisBounds],
      ],
    },
    timeSeriesSection[1],
    sections.annotations,
  ],
  formDataOverrides: formData => ({
    ...formData,
    groupby: getStandardizedControls().popAllColumns(),
    metrics: getStandardizedControls().popAllMetrics(),
  }),
};

export default config;

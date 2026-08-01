import { t } from '@zobi/core/translation';
import { getColumnLabel, QueryFormColumn } from '@zobi-ui/core';
import { GenericDataType } from '@zobi/core/common';
import {
  checkColumnType,
  ControlPanelConfig,
  ControlPanelsContainerProps,
  ControlSubSectionHeader,
  D3_TIME_FORMAT_DOCS,
  getStandardizedControls,
  sections,
  sharedControls,
} from '@zobi-ui/chart-controls';

import {
  DEFAULT_FORM_DATA,
  TIME_SERIES_DESCRIPTION_TEXT,
} from '../../constants';
import {
  legendSection,
  minorTicks,
  richTooltipSection,
  seriesOrderSection,
  showValueSectionWithoutStack,
  truncateXAxis,
  xAxisBounds,
  xAxisLabelRotation,
  xAxisLabelInterval,
  forceMaxInterval,
} from '../../../controls';

const {
  logAxis,
  markerEnabled,
  markerSize,
  minorSplitLine,
  rowLimit,
  truncateYAxis,
  yAxisBounds,
} = DEFAULT_FORM_DATA;
const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.echartsTimeSeriesQueryWithXAxisSort,
    sections.advancedAnalyticsControls,
    sections.annotationsAndLayersControls,
    sections.forecastIntervalControls,
    sections.titleControls,
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        ...seriesOrderSection,
        ['color_scheme'],
        ['time_shift_color'],
        ...showValueSectionWithoutStack,
        [
          {
            name: 'markerEnabled',
            config: {
              type: 'CheckboxControl',
              label: t('Marker'),
              renderTrigger: true,
              default: markerEnabled,
              description: t(
                'Draw a marker on data points. Only applicable for line types.',
              ),
            },
          },
        ],
        [
          {
            name: 'markerSize',
            config: {
              type: 'SliderControl',
              label: t('Marker Size'),
              renderTrigger: true,
              min: 0,
              max: 20,
              default: markerSize,
              description: t(
                'Size of marker. Also applies to forecast observations.',
              ),
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                Boolean(controls?.markerEnabled?.value),
            },
          },
        ],
        ['zoomable'],
        [minorTicks],
        ...legendSection,
        [<ControlSubSectionHeader>{t('X Axis')}</ControlSubSectionHeader>],
        [
          {
            name: 'x_axis_time_format',
            config: {
              ...sharedControls.x_axis_time_format,
              default: 'smart_date',
              description: `${D3_TIME_FORMAT_DOCS}. ${TIME_SERIES_DESCRIPTION_TEXT}`,
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                checkColumnType(
                  getColumnLabel(controls?.x_axis?.value as QueryFormColumn),
                  controls?.datasource?.datasource,
                  [GenericDataType.Temporal],
                ),
              disableStash: true,
              resetOnHide: false,
            },
          },
        ],
        [
          {
            name: 'x_axis_number_format',
            config: {
              ...sharedControls.x_axis_number_format,
              default: '~g',
              mapStateToProps: undefined,
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                checkColumnType(
                  getColumnLabel(controls?.x_axis?.value as QueryFormColumn),
                  controls?.datasource?.datasource,
                  [GenericDataType.Numeric],
                ),
            },
          },
        ],
        [xAxisLabelRotation],
        [xAxisLabelInterval],
        [forceMaxInterval],
        // eslint-disable-next-line react/jsx-key
        ...richTooltipSection,
        // eslint-disable-next-line react/jsx-key
        [<ControlSubSectionHeader>{t('Y Axis')}</ControlSubSectionHeader>],

        ['y_axis_format'],
        ['currency_format'],
        [
          {
            name: 'logAxis',
            config: {
              type: 'CheckboxControl',
              label: t('Logarithmic y-axis'),
              renderTrigger: true,
              default: logAxis,
              description: t('Logarithmic y-axis'),
            },
          },
        ],
        [
          {
            name: 'minorSplitLine',
            config: {
              type: 'CheckboxControl',
              label: t('Minor Split Line'),
              renderTrigger: true,
              default: minorSplitLine,
              description: t('Draw split lines for minor y-axis ticks'),
            },
          },
        ],
        [truncateXAxis],
        [xAxisBounds],
        [
          {
            name: 'truncateYAxis',
            config: {
              type: 'CheckboxControl',
              label: t('Truncate Y Axis'),
              default: truncateYAxis,
              renderTrigger: true,
              description: t(
                'Truncate Y Axis. Can be overridden by specifying a min or max bound.',
              ),
            },
          },
        ],
        [
          {
            name: 'y_axis_bounds',
            config: {
              type: 'BoundsControl',
              label: t('Y Axis Bounds'),
              renderTrigger: true,
              default: yAxisBounds,
              description: t(
                'Bounds for the Y-axis. When left empty, the bounds are ' +
                  'dynamically defined based on the min/max of the data. Note that ' +
                  "this feature will only expand the axis range. It won't " +
                  "narrow the data's extent.",
              ),
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                Boolean(controls?.truncateYAxis?.value),
            },
          },
        ],
        ['echart_options'],
      ],
    },
  ],
  controlOverrides: {
    row_limit: {
      default: rowLimit,
    },
  },
  formDataOverrides: formData => ({
    ...formData,
    metrics: getStandardizedControls().popAllMetrics(),
    groupby: getStandardizedControls().popAllColumns(),
  }),
};

export default config;

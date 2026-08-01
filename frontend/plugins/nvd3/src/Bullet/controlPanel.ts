import { t } from '@zobi.dev/extension-api/translation';
import { ControlPanelConfig } from '@zobi.dev/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [['metric'], ['adhoc_filters']],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'ranges',
            config: {
              type: 'TextControl',
              label: t('Ranges'),
              default: '',
              description: t('Ranges to highlight with shading'),
            },
          },
          {
            name: 'range_labels',
            config: {
              type: 'TextControl',
              label: t('Range labels'),
              default: '',
              description: t('Labels for the ranges'),
            },
          },
        ],
        [
          {
            name: 'markers',
            config: {
              type: 'TextControl',
              label: t('Markers'),
              default: '',
              description: t('List of values to mark with triangles'),
            },
          },
          {
            name: 'marker_labels',
            config: {
              type: 'TextControl',
              label: t('Marker labels'),
              default: '',
              description: t('Labels for the markers'),
            },
          },
        ],
        [
          {
            name: 'marker_lines',
            config: {
              type: 'TextControl',
              label: t('Marker lines'),
              default: '',
              description: t('List of values to mark with lines'),
            },
          },
          {
            name: 'marker_line_labels',
            config: {
              type: 'TextControl',
              label: t('Marker line labels'),
              default: '',
              description: t('Labels for the marker lines'),
            },
          },
        ],
      ],
    },
  ],
};

export default config;

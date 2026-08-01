import { t } from '@zobi.dev/extension-api/translation';
import { ControlPanelSectionConfig } from '../types';

export const annotationLayers = [];

export const annotationsAndLayersControls: ControlPanelSectionConfig = {
  label: t('Annotations and Layers'),
  expanded: false,
  tabOverride: 'data',
  controlSetRows: [
    [
      {
        name: 'annotation_layers',
        config: {
          type: 'AnnotationLayerControl',
          label: '',
          default: annotationLayers,
          description: t('Annotation Layers'),
          renderTrigger: false,
        },
      },
    ],
  ],
};

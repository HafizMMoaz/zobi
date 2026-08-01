
import { QueryFormData } from '@zobi-ui/core';

interface TooltipItem {
  item_type?: string;
  column_name?: string;
  metric_name?: string;
  label?: string;
  verbose_name?: string;
}

export const AGGREGATED_DECK_GL_CHART_TYPES = [
  'deck_screengrid',
  'deck_heatmap',
  'deck_contour',
  'deck_hex',
  'deck_grid',
];

export const NON_AGGREGATED_DECK_GL_CHART_TYPES = [
  'deck_scatter',
  'deck_arc',
  'deck_path',
  'deck_polygon',
  'deck_geojson',
];

export function isAggregatedDeckGLChart(vizType: string): boolean {
  return AGGREGATED_DECK_GL_CHART_TYPES.includes(vizType);
}

export function fieldHasMultipleValues(
  item: TooltipItem | string,
  formData: QueryFormData,
): boolean {
  if (!isAggregatedDeckGLChart(formData.viz_type)) {
    return false;
  }

  if (typeof item === 'object' && item?.item_type === 'metric') {
    return false;
  }

  // TODO: Currently only screengrid supports multi-value fields. Support for other aggregated charts will be added in future releases
  const supportsMultiValue = ['deck_screengrid'].includes(formData.viz_type);

  if (!supportsMultiValue) {
    return false;
  }

  if (typeof item === 'object' && item?.item_type === 'column') {
    return true;
  }

  if (typeof item === 'string') {
    return true;
  }

  return false;
}

const getFieldName = (item: TooltipItem | string): string | null => {
  if (typeof item === 'string') return item;
  if (item?.item_type === 'column') return item.column_name ?? null;
  if (item?.item_type === 'metric')
    return item.metric_name ?? item.label ?? null;
  return null;
};

const getFieldLabel = (item: TooltipItem | string): string => {
  if (typeof item === 'string') return item;
  if (item?.item_type === 'column') {
    return item.verbose_name || item.column_name || 'Column';
  }
  if (item?.item_type === 'metric') {
    return item.verbose_name || item.metric_name || item.label || 'Metric';
  }
  return 'Field';
};

const createMultiValueTemplate = (
  fieldName: string,
  fieldLabel: string,
): string => {
  const pluralFieldName = `${fieldName}s`;
  return `<div><strong>${fieldLabel}:</strong> {{#if ${pluralFieldName}}}{{limit ${pluralFieldName} 10}}{{#if ${fieldName}_count}} ({{${fieldName}_count}} total){{/if}}{{else}}N/A{{/if}}</div>`;
};

const createSingleValueTemplate = (
  fieldName: string,
  fieldLabel: string,
): string =>
  `<div><strong>${fieldLabel}:</strong> {{#if ${fieldName}}}{{${fieldName}}}{{else}}N/A{{/if}}</div>`;

export function createDefaultTemplateWithLimits(
  tooltipContents: (TooltipItem | string)[],
  formData: QueryFormData,
): string {
  if (!tooltipContents?.length) {
    return '';
  }

  const templateLines: string[] = [];

  tooltipContents.forEach(item => {
    const fieldName = getFieldName(item);
    const fieldLabel = getFieldLabel(item);

    if (!fieldName) return;

    const hasMultipleValues = fieldHasMultipleValues(item, formData);

    if (hasMultipleValues) {
      templateLines.push(createMultiValueTemplate(fieldName, fieldLabel));
    } else {
      templateLines.push(createSingleValueTemplate(fieldName, fieldLabel));
    }
  });

  return templateLines.join('\n');
}

export const MULTI_VALUE_WARNING_MESSAGE =
  'This metric or column contains many values, they may not be able to be all displayed in the tooltip';

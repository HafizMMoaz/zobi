import { ColumnMeta } from '@zobi.dev/chart-controls';
import { t } from '@zobi.dev/extension-api/translation';
import { getTooltipHTML } from '@zobi.dev/core/components/AsyncAceEditor';
import { COLUMN_AUTOCOMPLETE_SCORE } from 'src/SqlLab/constants';

export function getColumnKeywords(columns: ColumnMeta[]) {
  return columns.map(
    ({
      column_name,
      verbose_name,
      is_certified,
      certified_by,
      description,
      type,
    }) => ({
      name: verbose_name || column_name,
      value: column_name,
      documentation: getTooltipHTML({
        title: column_name,
        body: `type: ${type || 'unknown'}<br />${description ? `description: ${description}` : ''}`,
        footer: is_certified ? t('Certified by %s', certified_by) : undefined,
      }),
      score: COLUMN_AUTOCOMPLETE_SCORE,
      meta: 'column',
    }),
  );
}

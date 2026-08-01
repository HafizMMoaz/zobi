/* eslint-disable camelcase */

import { t } from '@zobi.dev/extension-api/translation';
import { isProbablyHTML, sanitizeHtml } from '@zobi.dev/core';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from '@zobi.dev/core/components';
import { CellRendererProps } from '../types';
import { SummaryContainer, SummaryText } from '../styles';

const SUMMARY_TOOLTIP_TEXT = t(
  'Show total aggregations of selected metrics. Note that row limit does not apply to the result.',
);

export const TextCellRenderer = (params: CellRendererProps) => {
  const { node, api, colDef, columns, allowRenderHtml, value, valueFormatted } =
    params;

  if (node?.rowPinned === 'bottom') {
    const cols = api.getAllGridColumns().filter(col => col.isVisible());
    const colAggCheck = !cols[0].getAggFunc();
    if (cols.length > 1 && colAggCheck && columns[0].key === colDef?.field) {
      return (
        <SummaryContainer>
          <SummaryText>{t('Summary')}</SummaryText>
          <Tooltip overlay={SUMMARY_TOOLTIP_TEXT}>
            <InfoCircleOutlined />
          </Tooltip>
        </SummaryContainer>
      );
    }
    if (!value) {
      return null;
    }
  }

  if (!(typeof value === 'string' || value instanceof Date)) {
    return valueFormatted ?? value;
  }

  if (typeof value === 'string') {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    }
    if (allowRenderHtml && isProbablyHTML(value)) {
      // Safe: HTML is sanitized before rendering
      // eslint-disable-next-line react/no-danger
      return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} />;
    }
  }

  return (
    <div>
      {valueFormatted ?? (value instanceof Date ? value.toISOString() : value)}
    </div>
  );
};

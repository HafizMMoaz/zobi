import { useState, ReactNode, useLayoutEffect, RefObject } from 'react';
import { css, styled, ZobiTheme } from '@zobi.dev/extension-api/theme';
import { SafeMarkdown, Tooltip, InfoTooltip } from '@zobi.dev/core/components';
import { ColumnTypeLabel } from './ColumnTypeLabel/ColumnTypeLabel';
import CertifiedIconWithTooltip from './CertifiedIconWithTooltip';
import { ColumnMeta } from '../types';
import {
  getColumnLabelText,
  getColumnTooltipNode,
  getColumnTypeTooltipNode,
} from './labelUtils';
import { SQLPopover } from './SQLPopover';

export type ColumnOptionProps = {
  column: ColumnMeta;
  showType?: boolean;
  labelRef?: RefObject<any>;
};

const StyleOverrides = styled.span`
  display: flex;
  align-items: center;
  svg {
    margin-right: ${({ theme }) => theme.sizeUnit}px;
  }
`;

export function ColumnOption({
  column,
  labelRef,
  showType = false,
}: ColumnOptionProps) {
  const { expression, column_name, type_generic } = column;
  const hasExpression = expression && expression !== column_name;
  const warningMarkdown =
    column.warning_markdown || column.warning_text || column.error_text;
  const type = hasExpression ? 'expression' : type_generic;
  const [tooltipText, setTooltipText] = useState<ReactNode>(column.column_name);
  const [columnTypeTooltipText, setcolumnTypeTooltipText] = useState<ReactNode>(
    getColumnTypeTooltipNode(column),
  );

  useLayoutEffect(() => {
    setTooltipText(getColumnTooltipNode(column, labelRef));
    setcolumnTypeTooltipText(getColumnTypeTooltipNode(column));
  }, [labelRef, column]);

  return (
    <StyleOverrides>
      {showType && type !== undefined && (
        <Tooltip
          id="metric-type-tooltip"
          title={columnTypeTooltipText}
          placement="bottomRight"
          align={{ offset: [8, -2] }}
        >
          <span>
            <ColumnTypeLabel type={type} />
          </span>
        </Tooltip>
      )}
      <Tooltip id="metric-name-tooltip" title={tooltipText}>
        <span
          className="option-label column-option-label"
          css={(theme: ZobiTheme) => css`
            margin-right: ${theme.sizeUnit}px;
          `}
          ref={labelRef}
        >
          {getColumnLabelText(column)}
        </span>
      </Tooltip>
      {hasExpression && <SQLPopover sqlExpression={expression} />}
      {column.is_certified && (
        <CertifiedIconWithTooltip
          metricName={column.metric_name}
          certifiedBy={column.certified_by}
          details={column.certification_details}
        />
      )}
      {warningMarkdown && (
        <InfoTooltip
          type="warning"
          tooltip={<SafeMarkdown source={warningMarkdown} />}
          label={`warn-${column.column_name}`}
          iconStyle={{ marginLeft: 0 }}
          {...(column.error_text && {
            type: 'error',
          })}
        />
      )}
    </StyleOverrides>
  );
}

export default ColumnOption;

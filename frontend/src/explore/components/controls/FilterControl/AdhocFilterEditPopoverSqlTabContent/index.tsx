import { useEffect, useRef, useMemo } from 'react';
import type { editors } from '@zobi.dev/extension-api';
import { Select } from '@zobi.dev/core/components';
import { t } from '@zobi.dev/extension-api/translation';
import { css, styled, useTheme } from '@zobi.dev/extension-api/theme';
import sqlKeywords from 'src/SqlLab/utils/sqlKeywords';
import { getColumnKeywords } from 'src/explore/controlUtils/getColumnKeywords';
import AdhocFilter from 'src/explore/components/controls/FilterControl/AdhocFilter';
import { OptionSortType } from 'src/explore/types';
import { ColumnMeta } from '@zobi.dev/chart-controls';
import SQLEditorWithValidation from 'src/components/SQLEditorWithValidation';
import { SqlExpressionType } from 'src/types/SqlExpression';
import { Clauses, ExpressionTypes } from '../types';

const StyledSelect = styled(Select)`
  ${({ theme }) => `
    width: ${theme.sizeUnit * 30}px;
    marginRight: ${theme.sizeUnit}px;
  `}
`;

export default function AdhocFilterEditPopoverSqlTabContent({
  adhocFilter,
  onChange,
  options,
  height,
  datasource,
}: {
  adhocFilter: AdhocFilter;
  onChange: (filter: AdhocFilter) => void;
  options: OptionSortType[];
  height: number;
  datasource?: any;
}) {
  const editorRef = useRef<editors.EditorHandle>(null);
  const theme = useTheme();

  useEffect(() => {
    editorRef.current?.resize();
  }, [adhocFilter]);

  const onSqlExpressionClauseChange = (clause: string) => {
    onChange(
      adhocFilter.duplicateWith({
        clause,
        expressionType: ExpressionTypes.Sql,
      }),
    );
  };

  const onSqlExpressionChange = (sqlExpression: string) => {
    onChange(
      adhocFilter.duplicateWith({
        sqlExpression,
        expressionType: ExpressionTypes.Sql,
      }),
    );
  };

  const keywords = useMemo(
    () =>
      sqlKeywords.concat(
        getColumnKeywords(
          options.filter(
            (option): option is ColumnMeta =>
              typeof option === 'object' &&
              option !== null &&
              'column_name' in option &&
              typeof option.column_name === 'string' &&
              'type' in option,
          ),
        ),
      ),
    [options],
  );

  const selectOptions = useMemo(
    () =>
      Object.values(Clauses).map(clause => ({
        label: clause,
        value: clause,
      })),
    [],
  );

  return (
    <span>
      <div className="filter-edit-clause-section">
        <div>
          <StyledSelect
            options={selectOptions}
            ariaLabel={t('Select column')}
            placeholder={t('choose WHERE or HAVING...')}
            value={adhocFilter.clause}
            onChange={value => onSqlExpressionClauseChange(value as string)}
          />
        </div>
        <span className="filter-edit-clause-info">
          <strong>WHERE</strong> {t('Filters by columns')}
          <br />
          <strong>HAVING</strong> {t('Filters by metrics')}
        </span>
      </div>
      <div
        css={css`
          margin-top: ${theme.sizeUnit * 4}px;
        `}
      >
        <SQLEditorWithValidation
          ref={editorRef}
          keywords={keywords}
          height={`${height - 130}px`}
          onChange={onSqlExpressionChange}
          width="100%"
          lineNumbers={false}
          value={adhocFilter.sqlExpression || adhocFilter.translateToSql()}
          wordWrap
          showValidation
          expressionType={
            adhocFilter.clause === 'HAVING'
              ? SqlExpressionType.HAVING
              : SqlExpressionType.WHERE
          }
          datasourceId={datasource?.id}
          datasourceType={datasource?.type}
        />
      </div>
    </span>
  );
}

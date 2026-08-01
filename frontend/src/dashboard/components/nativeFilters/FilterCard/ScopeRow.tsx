import { memo, useMemo } from 'react';
import { t } from '@zobi/core/translation';
import { useTruncation } from '@zobi-ui/core';
import { css } from '@zobi/core/theme';
import { List } from '@zobi-ui/core/components/List';
import { useFilterScope } from './useFilterScope';
import { Row, RowLabel, RowTruncationCount, RowValue } from './Styles';
import { FilterCardRowProps } from './types';
import { TooltipWithTruncation } from './TooltipWithTruncation';

const getTooltipSection = (items: string[] | undefined, label: string) =>
  Array.isArray(items) && items.length > 0 ? (
    <>
      <span
        css={theme => css`
          font-weight: ${theme.fontWeightStrong};
        `}
      >
        {label}:
      </span>
      <List
        size="small"
        split={false}
        dataSource={items}
        renderItem={item => (
          <List.Item
            compact
            css={theme => css`
              && .scope-item {
                color: ${theme.colorWhite};
              }
            `}
          >
            <span className="scope-item">• {item} </span>
          </List.Item>
        )}
      />
    </>
  ) : null;
export const ScopeRow = memo(({ filter }: FilterCardRowProps) => {
  const scope = useFilterScope(filter);

  const [scopeRef, plusRef, elementsTruncated, hasHiddenElements] =
    useTruncation();
  const tooltipText = useMemo(() => {
    if (elementsTruncated === 0 || !scope) {
      return null;
    }
    if (scope.all) {
      return <span>{t('All charts')}</span>;
    }
    return (
      <div>
        {getTooltipSection(scope.tabs, t('Tabs'))}
        {getTooltipSection(scope.charts, t('Charts'))}
      </div>
    );
  }, [elementsTruncated, scope]);

  return (
    <Row>
      <RowLabel>{t('Scope')}</RowLabel>
      <TooltipWithTruncation title={tooltipText}>
        <RowValue ref={scopeRef}>
          {scope
            ? Object.values(scope)
                .flat()
                .map((element, index) => (
                  <span key={element}>
                    {index === 0 ? element : `, ${element}`}
                  </span>
                ))
            : t('None')}
        </RowValue>
        {hasHiddenElements && (
          <RowTruncationCount ref={plusRef}>
            +{elementsTruncated}
          </RowTruncationCount>
        )}
      </TooltipWithTruncation>
    </Row>
  );
});

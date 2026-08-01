import { memo, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { t } from '@zobi.dev/extension-api/translation';
import { useTruncation } from '@zobi.dev/core';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { setDirectPathToChild } from 'src/dashboard/actions/dashboardState';
import { List } from '@zobi.dev/core/components/List';
import {
  DependencyItem,
  Row,
  RowLabel,
  RowTruncationCount,
  RowValue,
} from './Styles';
import { useFilterDependencies } from './useFilterDependencies';
import { DependencyValueProps, FilterCardRowProps } from './types';
import { TooltipWithTruncation } from './TooltipWithTruncation';

const DependencyValue = ({
  dependency,
  hasSeparator,
}: DependencyValueProps) => {
  const dispatch = useDispatch();
  const handleClick = useCallback(() => {
    dispatch(setDirectPathToChild([dependency.id]));
  }, [dependency.id, dispatch]);
  return (
    <span>
      {hasSeparator && <span>, </span>}
      <DependencyItem role="button" onClick={handleClick} tabIndex={0}>
        {dependency.name}
      </DependencyItem>
    </span>
  );
};

export const DependenciesRow = memo(({ filter }: FilterCardRowProps) => {
  const dependencies = useFilterDependencies(filter);
  const [dependenciesRef, plusRef, elementsTruncated, hasHiddenElements] =
    useTruncation();
  const theme = useTheme();

  const tooltipText = useMemo(
    () =>
      elementsTruncated > 0 && dependencies ? (
        <List
          split={false}
          dataSource={dependencies}
          renderItem={dependency => (
            <List.Item
              compact
              css={theme => css`
                && .dependency-item {
                  color: ${theme.colorWhite};
                }
              `}
            >
              <span className="dependency-item">
                • <DependencyValue dependency={dependency} />
              </span>
            </List.Item>
          )}
        />
      ) : null,
    [elementsTruncated, dependencies],
  );

  if (!Array.isArray(dependencies) || dependencies.length === 0) {
    return null;
  }
  return (
    <Row>
      <RowLabel
        css={css`
          display: inline-flex;
          align-items: center;
        `}
      >
        {t('Dependent on')}{' '}
        <TooltipWithTruncation
          title={t(
            'Filter only displays values relevant to selections made in other filters.',
          )}
        >
          <Icons.InfoCircleOutlined
            iconSize="m"
            iconColor={theme.colorIcon}
            css={css`
              margin-left: ${theme.sizeUnit}px;
            `}
          />
        </TooltipWithTruncation>
      </RowLabel>
      <TooltipWithTruncation title={tooltipText}>
        <RowValue ref={dependenciesRef}>
          {dependencies.map((dependency, index) => (
            <DependencyValue
              key={dependency.id}
              dependency={dependency}
              hasSeparator={index !== 0}
            />
          ))}
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

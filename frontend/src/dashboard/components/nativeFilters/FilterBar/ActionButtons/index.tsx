import { useMemo } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import {
  DataMaskState,
  DataMaskStateWithId,
  isDefined,
  ChartCustomization,
  ChartCustomizationDivider,
} from '@zobi.dev/core';
import { css, ZobiTheme, styled } from '@zobi.dev/extension-api/theme';
import { Button, Tooltip, Icons, Flex } from '@zobi.dev/core/components';
import tinycolor from 'tinycolor2';
import { FilterBarOrientation } from 'src/dashboard/types';
import { getFilterBarTestId } from '../utils';

interface ActionButtonsProps {
  onApply: () => void;
  onClearAll: () => void;
  dataMaskSelected: DataMaskState;
  dataMaskApplied: DataMaskStateWithId;
  chartCustomizationItems?: (ChartCustomization | ChartCustomizationDivider)[];
  isApplyDisabled: boolean;
  filterBarOrientation?: FilterBarOrientation;
  hasOutOfScopeRequiredFilters?: boolean;
}

const ButtonsContainer = styled.div<{ isVertical: boolean }>`
  ${({ theme, isVertical }) => css`
    display: flex;

    ${isVertical
      ? css`
          flex-direction: column;
          align-items: center;
          position: sticky;
          z-index: 100;
          bottom: 0;
          padding: ${theme.sizeUnit * 4}px;
          padding-top: ${theme.sizeUnit * 6}px;
          background: linear-gradient(
            ${tinycolor(theme.colorBgLayout).setAlpha(0).toRgbString()},
            ${theme.colorBgContainer} 20%
          );
        `
      : css`
          align-items: center;
          margin-left: auto;
        `}
  `}
`;

const applyButtonStyle = (theme: ZobiTheme, isVertical: boolean) => css`
  ${isVertical &&
  css`
    margin-bottom: ${theme.sizeUnit * 3}px;
  `}
`;

const clearAllButtonStyle = (theme: ZobiTheme, isVertical: boolean) => css`
  && {
    color: ${theme.colorTextSecondary};
    margin-left: 0;

    &:hover {
      color: ${theme.colorPrimaryText};
    }

    &[disabled],
    &[disabled]:hover {
      color: ${theme.colorTextDisabled};
    }

    ${!isVertical &&
    css`
      text-transform: capitalize;
      font-weight: ${theme.fontWeightNormal};
    `}
  }
`;

const ActionButtons = ({
  onApply,
  onClearAll,
  dataMaskApplied,
  dataMaskSelected,
  isApplyDisabled,
  filterBarOrientation = FilterBarOrientation.Vertical,
  chartCustomizationItems,
  hasOutOfScopeRequiredFilters = false,
}: ActionButtonsProps) => {
  const isVertical = filterBarOrientation === FilterBarOrientation.Vertical;

  const isClearAllEnabled = useMemo(() => {
    const hasSelectedChanges = Object.entries(dataMaskSelected).some(
      ([, mask]) => {
        const hasValue = isDefined(mask?.filterState?.value);
        const hasGroupBy = isDefined(mask?.ownState?.column);
        return hasValue || hasGroupBy;
      },
    );

    const hasAppliedChanges = Object.entries(dataMaskApplied).some(
      ([, mask]) => {
        const hasValue = isDefined(mask?.filterState?.value);
        const hasGroupBy = isDefined(mask?.ownState?.column);
        return hasValue || hasGroupBy;
      },
    );

    const hasChartCustomizations = chartCustomizationItems?.some(item => {
      if (item.removed) return false;
      const mask = dataMaskApplied[item.id] || dataMaskSelected[item.id];
      const hasValue = isDefined(mask?.filterState?.value);
      const hasGroupBy = isDefined(mask?.ownState?.column);
      return hasValue || hasGroupBy;
    });

    return hasSelectedChanges || hasAppliedChanges || hasChartCustomizations;
  }, [dataMaskSelected, dataMaskApplied, chartCustomizationItems]);

  return (
    <ButtonsContainer
      isVertical={isVertical}
      data-test="filterbar-action-buttons"
    >
      <Button
        disabled={isApplyDisabled}
        buttonStyle="primary"
        htmlType="submit"
        css={(theme: ZobiTheme) => applyButtonStyle(theme, isVertical)}
        onClick={onApply}
        {...getFilterBarTestId('apply-button')}
      >
        {isVertical ? t('Apply filters') : t('Apply')}
      </Button>
      <Flex>
        <Button
          disabled={!isClearAllEnabled}
          buttonStyle="link"
          css={(theme: ZobiTheme) => clearAllButtonStyle(theme, isVertical)}
          onClick={onClearAll}
          {...getFilterBarTestId('clear-button')}
        >
          {t('Clear all')}
        </Button>
        {hasOutOfScopeRequiredFilters && (
          <Tooltip
            title={t(
              'Some required filters on other tabs have values and will not be cleared',
            )}
          >
            <Icons.InfoCircleOutlined
              iconSize="s"
              css={(theme: ZobiTheme) => css`
                margin-left: ${theme.sizeUnit}px;
              `}
            />
          </Tooltip>
        )}
      </Flex>
    </ButtonsContainer>
  );
};

export default ActionButtons;

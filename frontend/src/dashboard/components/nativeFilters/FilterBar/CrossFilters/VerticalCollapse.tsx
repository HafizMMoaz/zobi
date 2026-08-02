import { useMemo, useState, useCallback } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, useTheme, ZobiTheme } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { FilterBarOrientation } from 'src/dashboard/types';
import CrossFilter from './CrossFilter';
import { CrossFilterIndicator } from '../../selectors';

const CrossFiltersVerticalCollapse = (props: {
  crossFilters: CrossFilterIndicator[];
  hideHeader?: boolean;
}) => {
  const { crossFilters, hideHeader = false } = props;
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSection = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const sectionContainerStyle = useCallback(
    (theme: ZobiTheme) => css`
      margin-bottom: ${theme.sizeUnit * 3}px;
      padding: 0 ${theme.sizeUnit * 4}px;
    `,
    [],
  );

  const sectionHeaderStyle = useCallback(
    (theme: ZobiTheme) => css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: ${theme.sizeUnit * 2}px 0;
      cursor: pointer;
      user-select: none;

      &:hover {
        background: ${theme.colorBgTextHover};
        margin: 0 -${theme.sizeUnit * 2}px;
        padding: ${theme.sizeUnit * 2}px;
        border-radius: ${theme.borderRadius}px;
      }
    `,
    [],
  );

  const sectionTitleStyle = useCallback(
    (theme: ZobiTheme) => css`
      margin: 0;
      font-size: ${theme.fontSize}px;
      font-weight: ${theme.fontWeightStrong};
      color: ${theme.colorText};
      line-height: 1.3;
    `,
    [],
  );

  const sectionContentStyle = useCallback(
    (theme: ZobiTheme) => css`
      padding: ${theme.sizeUnit * 2}px 0;
    `,
    [],
  );

  const dividerStyle = useCallback(
    (theme: ZobiTheme) => css`
      height: 1px;
      background: ${theme.colorSplit};
      margin: ${theme.sizeUnit * 2}px 0;
    `,
    [],
  );

  const iconStyle = useCallback(
    (isOpen: boolean, theme: ZobiTheme) => css`
      transform: ${isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
      transition: transform 0.2s ease;
      color: ${theme.colorTextSecondary};
    `,
    [],
  );

  const crossFiltersIndicators = useMemo(
    () =>
      crossFilters.map(filter => (
        <CrossFilter
          key={filter.emitterId}
          filter={filter}
          orientation={FilterBarOrientation.Vertical}
        />
      )),
    [crossFilters],
  );

  if (!crossFilters.length) {
    return null;
  }

  return (
    <div css={sectionContainerStyle}>
      {!hideHeader && (
        <div
          css={sectionHeaderStyle}
          onClick={toggleSection}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleSection();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <h4 css={sectionTitleStyle}>{t('Cross-filters')}</h4>
          <Icons.UpOutlined iconSize="m" css={iconStyle(isOpen, theme)} />
        </div>
      )}
      {isOpen && <div css={sectionContentStyle}>{crossFiltersIndicators}</div>}
      {isOpen && <div css={dividerStyle} data-test="cross-filters-divider" />}
    </div>
  );
};

export default CrossFiltersVerticalCollapse;

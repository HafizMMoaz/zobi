
import { t } from '@zobi.dev/extension-api/translation';
import { useCSSTextTruncation } from '@zobi.dev/core';
import { css, styled, useTheme } from '@zobi.dev/extension-api/theme';
import { Tooltip } from '@zobi.dev/core/components';
import { FilterBarOrientation } from 'src/dashboard/types';
import { Icons } from '@zobi.dev/core/components/Icons';
import { ellipsisCss } from './styles';

const StyledCrossFilterTitle = styled.div`
  ${({ theme }) => `
    display: flex;
    font-size: ${theme.fontSizeSM}px;
    color: ${theme.colorText};
    vertical-align: middle;
    align-items: center;
  `}
`;

const StyledIconSearch = styled(Icons.SearchOutlined)`
  ${({ theme }) => `
    & > span.anticon.anticon-search {
      color: ${theme.colorIcon};
      margin-left: ${theme.sizeUnit}px;
      transition: 0.3s;
      vertical-align: middle;
      line-height: 0;
      &:hover {
        color: ${theme.colorIconHover};
      }
    }
  `}
`;

const CrossFilterChartTitle = (props: {
  title: string;
  orientation: FilterBarOrientation;
  onHighlightFilterSource: () => void;
}) => {
  const { title, orientation, onHighlightFilterSource } = props;
  const [titleRef, titleIsTruncated] = useCSSTextTruncation<HTMLSpanElement>();
  const theme = useTheme();
  return (
    <StyledCrossFilterTitle>
      <Tooltip title={titleIsTruncated ? title : null}>
        <span
          css={css`
            max-width: ${orientation === FilterBarOrientation.Vertical
              ? `${theme.sizeUnit * 45}px`
              : `${theme.sizeUnit * 15}px`};
            line-height: 1.4;
            ${ellipsisCss}
          `}
          ref={titleRef}
        >
          {title}
        </span>
      </Tooltip>
      <Tooltip title={t('Locate the chart')}>
        <StyledIconSearch
          iconSize="s"
          data-test="cross-filters-highlight-emitter"
          role="button"
          tabIndex={0}
          onClick={onHighlightFilterSource}
        />
      </Tooltip>
    </StyledCrossFilterTitle>
  );
};

export default CrossFilterChartTitle;

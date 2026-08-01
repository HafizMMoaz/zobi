
import { getColumnLabel, useCSSTextTruncation } from '@zobi.dev/core';
import { styled, css, useTheme } from '@zobi.dev/extension-api/theme';
import { CrossFilterIndicator } from 'src/dashboard/components/nativeFilters/selectors';
import { Tag } from 'src/components/Tag';
import { Tooltip } from '@zobi.dev/core/components';
import { FilterBarOrientation } from 'src/dashboard/types';
import { ellipsisCss } from './styles';

const StyledCrossFilterValue = styled.b`
  ${({ theme }) => `
    max-width: ${theme.sizeUnit * 25}px;
  `}
  ${ellipsisCss}
`;

const StyledCrossFilterColumn = styled('span')`
  ${({ theme }) => `
    max-width: ${theme.sizeUnit * 25}px;
    padding-right: ${theme.sizeUnit}px;
  `}
  ${ellipsisCss}
`;

const StyledTag = styled(Tag)`
  ${({ theme }) => `
    border: 1px solid ${theme.colorBorder};
    border-radius: 2px;
    .anticon-close {
      vertical-align: middle;
    }
  `}
`;

const CrossFilterTag = (props: {
  filter: CrossFilterIndicator;
  orientation: FilterBarOrientation;
  removeCrossFilter: (filterId: number) => void;
}) => {
  const { filter, orientation, removeCrossFilter } = props;
  const theme = useTheme();
  const [columnRef, columnIsTruncated] =
    useCSSTextTruncation<HTMLSpanElement>();
  const [valueRef, valueIsTruncated] = useCSSTextTruncation<HTMLSpanElement>();

  const columnLabel =
    filter.customColumnLabel || getColumnLabel(filter.column ?? '');

  return (
    <StyledTag
      css={css`
        ${orientation === FilterBarOrientation.Vertical
          ? `
            margin-top: ${theme.sizeUnit * 2}px;
          `
          : `
            margin-left: ${theme.sizeUnit * 2}px;
          `}
      `}
      closable
      onClose={() => removeCrossFilter(filter.emitterId)}
      editable
    >
      <Tooltip title={columnIsTruncated ? columnLabel : null}>
        <StyledCrossFilterColumn ref={columnRef}>
          {columnLabel}
        </StyledCrossFilterColumn>
      </Tooltip>
      <Tooltip title={valueIsTruncated ? filter.value : null}>
        <StyledCrossFilterValue ref={valueRef}>
          {filter.value}
        </StyledCrossFilterValue>
      </Tooltip>
    </StyledTag>
  );
};

export default CrossFilterTag;

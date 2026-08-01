import { css, styled } from '@zobi/core/theme';

export const Row = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    margin: ${theme.sizeUnit}px 0;
    font-size: ${theme.fontSizeSM}px;

    &:first-of-type {
      margin-top: 0;
    }

    &:last-of-type {
      margin-bottom: 0;
    }

    & .ant-tooltip-open {
      display: inline-flex;
    }
  `};
`;

export const RowLabel = styled.span`
  ${({ theme }) => css`
    color: ${theme.colorText};
    padding-right: ${theme.sizeUnit * 4}px;
    margin-right: auto;
    white-space: nowrap;
  `};
`;

export const RowValue = styled.div`
  ${({ theme }) => css`
    color: ${theme.colorText};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline;
  `};
`;

export const FilterName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DependencyItem = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

export const RowTruncationCount = styled.span`
  ${({ theme }) => css`
    color: ${theme.colorPrimary};
  `}
`;

export const TooltipTrigger = styled.div`
  min-width: 0;
  display: inline-flex;
  white-space: nowrap;
`;

export const InternalRow = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
`;

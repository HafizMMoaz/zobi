import { styled } from '@zobi/core/theme';

export const ExplorePopoverContent = styled.div`
  .edit-popover-resize {
    transform: scaleX(-1);
    float: right;
    margin-top: ${({ theme }) => theme.margin}px;
    margin-right: ${({ theme }) => theme.marginXXS * -1}px;
    color: ${({ theme }) => theme.colorIcon};
    cursor: nwse-resize;
  }
  .filter-sql-editor {
    border: ${({ theme }) => theme.colorBorder} solid thin;
  }
  && .ant-tabs-nav {
    margin-bottom: ${({ theme }) => theme.marginSM}px;
  }
  && .ant-form-item {
    margin-bottom: ${({ theme }) => theme.marginXS}px;
  }
`;

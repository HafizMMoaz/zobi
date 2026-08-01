/* eslint-disable theme-colors/no-literal-colors */
import { t } from '@zobi/core/translation';
import {
  VerticalLeftOutlined,
  VerticalRightOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Select } from '@zobi-ui/core/components';
import {
  PaginationContainer,
  SelectWrapper,
  PageInfo,
  PageCount,
  PageButton,
  ButtonGroup,
} from '../../styles';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalRows: number;
  pageSizeOptions: number[];
  onServerPaginationChange: (pageNumber: number, pageSize: number) => void;
  onServerPageSizeChange: (pageSize: number) => void;
  sliceId: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage = 0,
  pageSize = 10,
  totalRows = 0,
  pageSizeOptions = [10, 20, 50, 100, 200],
  onServerPaginationChange = () => {},
  onServerPageSizeChange = () => {},
  sliceId,
}) => {
  const totalPages = Math.ceil(totalRows / pageSize);
  const startRow = currentPage * pageSize + 1;
  const endRow = Math.min((currentPage + 1) * pageSize, totalRows);

  const handleNextPage = (disabled: boolean) => () => {
    if (disabled) return;
    onServerPaginationChange(currentPage + 1, pageSize);
  };

  const handlePrevPage = (disabled: boolean) => () => {
    if (disabled) return;
    onServerPaginationChange(currentPage - 1, pageSize);
  };

  const handleNavigateToFirstPage = (disabled: boolean) => () => {
    if (disabled) return;
    onServerPaginationChange(0, pageSize);
  };

  const handleNavigateToLastPage = (disabled: boolean) => () => {
    if (disabled) return;
    onServerPaginationChange(totalPages - 1, pageSize);
  };

  const selectOptions = pageSizeOptions.map(size => ({
    value: size,
    label: size,
  }));

  return (
    <PaginationContainer>
      <span>{t('Page Size:')}</span>
      <SelectWrapper>
        <Select
          value={`${pageSize}`}
          options={selectOptions}
          onChange={(value: string) => {
            onServerPageSizeChange(Number(value));
          }}
          getPopupContainer={() =>
            document.getElementById(`chart-id-${sliceId}`) as HTMLElement
          }
        />
      </SelectWrapper>
      <PageInfo>
        <span>{startRow}</span> {t('to')} <span>{endRow}</span> {t('of')}{' '}
        <span>{totalRows}</span>
      </PageInfo>

      <ButtonGroup>
        <PageButton
          onClick={handleNavigateToFirstPage(currentPage === 0)}
          disabled={currentPage === 0}
        >
          <VerticalRightOutlined />
        </PageButton>
        <PageButton
          onClick={handlePrevPage(currentPage === 0)}
          disabled={currentPage === 0}
        >
          <LeftOutlined />
        </PageButton>
        <PageCount>
          {t('Page')} <span>{currentPage + 1}</span> {t('of')}{' '}
          <span>{totalPages}</span>
        </PageCount>
        <PageButton
          onClick={handleNextPage(!!(currentPage >= totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
        >
          <RightOutlined />
        </PageButton>
        <PageButton
          onClick={handleNavigateToLastPage(!!(currentPage >= totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
        >
          <VerticalLeftOutlined />
        </PageButton>
      </ButtonGroup>
    </PaginationContainer>
  );
};

export default Pagination;

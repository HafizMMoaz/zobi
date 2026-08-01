import { ReactNode, MouseEvent as ReactMouseEvent } from 'react';
import { TableInstance, Row, UseRowSelectRowProps } from 'react-table';
import { styled } from '@zobi.dev/extension-api/theme';
import cx from 'classnames';

interface CardCollectionProps {
  bulkSelectEnabled?: boolean;
  loading: boolean;
  prepareRow: TableInstance['prepareRow'];
  renderCard?: (row: any) => ReactNode;
  rows: TableInstance['rows'];
  showThumbnails?: boolean;
}

const CardContainer = styled.div<{ showThumbnails?: boolean }>`
  ${({ theme, showThumbnails }) => `
    display: grid;
    justify-content: start;
    grid-gap: ${theme.sizeUnit * 12}px ${theme.sizeUnit * 4}px;
    grid-template-columns: repeat(auto-fit, 300px);
    margin-top: ${theme.sizeUnit * -6}px;
    padding: ${
      showThumbnails
        ? `${theme.sizeUnit * 8 + 3}px ${theme.sizeUnit * 20}px`
        : `${theme.sizeUnit * 8 + 1}px ${theme.sizeUnit * 20}px`
    };
  `}
`;

const CardWrapper = styled.div`
  border: 2px solid transparent;
  &.card-selected {
    border: 2px solid ${({ theme }) => theme.colorPrimary};
  }
  &.bulk-select {
    cursor: pointer;
  }
`;

export default function CardCollection({
  bulkSelectEnabled,
  loading,
  prepareRow,
  renderCard,
  rows,
  showThumbnails,
}: CardCollectionProps) {
  function handleClick(
    event: ReactMouseEvent<HTMLDivElement, MouseEvent>,
    toggleRowSelected: (value?: boolean) => void,
  ) {
    if (bulkSelectEnabled) {
      event.preventDefault();
      event.stopPropagation();
      toggleRowSelected();
    }
  }

  if (!renderCard) return null;
  return (
    <CardContainer showThumbnails={showThumbnails}>
      {loading &&
        rows.length === 0 &&
        Array.from({ length: 25 }, (_, i) => (
          <div key={i}>{renderCard({ loading })}</div>
        ))}
      {rows.length > 0 &&
        rows.map(row => {
          if (!renderCard) return null;
          prepareRow(row);
          return (
            <CardWrapper
              className={cx({
                'card-selected':
                  bulkSelectEnabled &&
                  (row as Row & UseRowSelectRowProps<any>).isSelected,
                'bulk-select': bulkSelectEnabled,
              })}
              key={row.id}
              onClick={e =>
                handleClick(
                  e,
                  (row as Row & UseRowSelectRowProps<any>).toggleRowSelected,
                )
              }
              role="none"
            >
              {renderCard({ ...row.original, loading })}
            </CardWrapper>
          );
        })}
    </CardContainer>
  );
}

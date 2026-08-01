import { CSSProperties, forwardRef, memo, Ref } from 'react';

export interface PaginationProps {
  pageCount: number; // number of pages
  currentPage?: number; // index of current page, zero-based
  maxPageItemCount?: number;
  ellipsis?: string; // content for ellipsis item
  onPageChange: (page: number) => void; // `page` is zero-based
  style?: CSSProperties;
}

// first, ..., prev, current, next, ..., last
const MINIMAL_PAGE_ITEM_COUNT = 7;

/**
 * Generate numeric page items around current page.
 *   - Always include first and last page
 *   - Add ellipsis if needed
 */
export function generatePageItems(
  total: number,
  current: number,
  width: number,
) {
  if (width < MINIMAL_PAGE_ITEM_COUNT) {
    throw new Error(
      `Must allow at least ${MINIMAL_PAGE_ITEM_COUNT} page items`,
    );
  }
  if (width % 2 === 0) {
    throw new Error(`Must allow odd number of page items`);
  }
  if (total < width) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const left = Math.max(
    0,
    Math.min(total - width, current - Math.floor(width / 2)),
  );
  const items: (string | number)[] = Array.from(
    { length: width },
    (_, i) => i + left,
  );
  // replace non-ending items with placeholders
  if (typeof items[0] === 'number' && items[0] > 0) {
    items[0] = 0;
    items[1] = 'prev-more';
  }
  const lastItem = items[items.length - 1];
  if (typeof lastItem === 'number' && lastItem < total - 1) {
    items[items.length - 1] = total - 1;
    items[items.length - 2] = 'next-more';
  }
  return items;
}

export default memo(
  forwardRef(function Pagination(
    {
      style,
      pageCount,
      currentPage = 0,
      maxPageItemCount = 9,
      onPageChange,
    }: PaginationProps,
    ref: Ref<HTMLDivElement>,
  ) {
    const pageItems = generatePageItems(
      pageCount,
      currentPage,
      maxPageItemCount,
    );
    return (
      <div ref={ref} className="dt-pagination" style={style}>
        <ul className="pagination pagination-sm">
          {pageItems.map(item =>
            typeof item === 'number' ? (
              // actual page number
              <li
                key={item}
                className={currentPage === item ? 'active' : undefined}
              >
                <a
                  href={`#page-${item}`}
                  role="button"
                  onClick={e => {
                    e.preventDefault();
                    onPageChange(item);
                  }}
                >
                  {item + 1}
                </a>
              </li>
            ) : (
              <li key={item} className="dt-pagination-ellipsis">
                <span>…</span>
              </li>
            ),
          )}
        </ul>
      </div>
    );
  }),
);

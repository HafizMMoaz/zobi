import { useCallback, useMemo } from 'react';
import { Tag } from 'src/components/Tag';
import { t } from '@zobi.dev/extension-api/translation';
import { BinaryQueryObjectFilterClause, isAdhocColumn } from '@zobi.dev/core';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import RowCountLabel from 'src/components/RowCountLabel';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Tooltip } from '@zobi.dev/core/components';
import { CopyToClipboardButton } from 'src/explore/components/DataTableControl';
import { TabularDataRow } from 'src/utils/common';
import { usePermissions } from 'src/hooks/usePermissions';
import DownloadDropdown from './DownloadDropdown';

export type TableControlsProps = {
  filters: BinaryQueryObjectFilterClause[];
  setFilters: (filters: BinaryQueryObjectFilterClause[]) => void;
  totalCount?: number;
  loading: boolean;
  onReload: () => void;
  canDownload: boolean;
  onDownloadCSV: () => void;
  onDownloadXLSX: () => void;
  data?: TabularDataRow[];
  columnNames?: string[];
};

export default function TableControls({
  filters,
  setFilters,
  totalCount,
  loading,
  onReload,
  canDownload,
  onDownloadCSV,
  onDownloadXLSX,
  data,
  columnNames,
}: TableControlsProps) {
  const theme = useTheme();
  const { canCopyClipboard: copyEnabled } = usePermissions();
  const filterMap: Record<string, BinaryQueryObjectFilterClause> = useMemo(
    () =>
      Object.assign(
        {},
        ...filters.map(filter => ({
          [isAdhocColumn(filter.col)
            ? (filter.col.label as string)
            : filter.col]: filter,
        })),
      ),
    [filters],
  );

  const removeFilter = useCallback(
    (colName: string) => {
      const updatedFilterMap = { ...filterMap };
      delete updatedFilterMap[colName];
      setFilters(Object.values(updatedFilterMap));
    },
    [filterMap, setFilters],
  );

  const filterTags = useMemo(
    () =>
      Object.entries(filterMap)
        .map(([colName, { val, formattedVal }]) => ({
          colName,
          val: formattedVal ?? val,
        }))
        .sort((a, b) => a.colName.localeCompare(b.colName)),
    [filterMap],
  );

  return (
    <div
      css={css`
        display: flex;
        justify-content: space-between;
        padding: ${theme.sizeUnit / 2}px 0;
        margin-bottom: ${theme.sizeUnit * 2}px;
      `}
    >
      <div
        css={css`
          display: flex;
          flex-wrap: wrap;
        `}
      >
        {filterTags.map(({ colName, val }, index) => (
          <Tag
            editable
            onDelete={removeFilter.bind(null, colName)}
            index={index}
            id={index}
            key={colName}
            name={`${colName}=${val}`}
            data-test="filter-col"
          >
            <span
              css={css`
                margin-right: ${theme.sizeUnit}px;
              `}
            >
              {colName}
            </span>
            <strong data-test="filter-val">{String(val)}</strong>
          </Tag>
        ))}
      </div>
      <div
        css={css`
          display: flex;
          align-items: center;
          height: min-content;
          gap: ${theme.sizeUnit * 3}px;
        `}
      >
        <RowCountLabel loading={loading && !totalCount} rowcount={totalCount} />
        {canDownload && (
          <DownloadDropdown
            onDownloadCSV={onDownloadCSV}
            onDownloadXLSX={onDownloadXLSX}
          />
        )}
        {copyEnabled ? (
          <CopyToClipboardButton data={data} columns={columnNames} />
        ) : (
          <Tooltip title={t("You don't have permission to copy to clipboard")}>
            <span>
              <CopyToClipboardButton
                data={data}
                columns={columnNames}
                disabled
              />
            </span>
          </Tooltip>
        )}
        <Tooltip title={t('Reload')}>
          <Icons.ReloadOutlined
            iconColor={theme.colorIcon}
            iconSize="l"
            aria-label={t('Reload')}
            role="button"
            onClick={onReload}
          />
        </Tooltip>
      </div>
    </div>
  );
}

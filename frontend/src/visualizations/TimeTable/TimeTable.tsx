import { useMemo, ReactNode } from 'react';
import { InfoTooltip, TableView } from '@zobi-ui/core/components';
import { t } from '@zobi/core/translation';
import { styled } from '@zobi/core/theme';
import { sortNumberWithMixedTypes, processTimeTableData } from './utils';
import { ValueCell, LeftCell, Sparkline } from './components';
import type { TimeTableProps } from './types';

// @z-index-above-dashboard-charts + 1 = 11
const TimeTableStyles = styled.div<{ height?: number }>`
  height: ${props => props.height}px;
  overflow: auto;

  th {
    z-index: 11 !important; // to cover sparkline
  }
`;

const TimeTable = ({
  className = '',
  height,
  data,
  columnConfigs,
  rowType,
  rows,
  url = '',
}: TimeTableProps) => {
  const memoizedColumns = useMemo(
    () => [
      {
        accessor: 'metric',
        Header: t('Metric'),
        id: 'metric', // REQUIRED: TableView needs both accessor and id to render rows
      },
      ...columnConfigs.map((columnConfig, i) => ({
        accessor: columnConfig.key,
        id: columnConfig.key, // REQUIRED: TableView needs both accessor and id to render rows
        cellProps: columnConfig.colType === 'spark' && {
          style: { width: '1%' },
        },
        Header: () => (
          <>
            {columnConfig.label}{' '}
            {columnConfig.tooltip && (
              <InfoTooltip
                tooltip={columnConfig.tooltip}
                label={`tt-col-${i}`}
                placement="top"
              />
            )}
          </>
        ),
        sortType: sortNumberWithMixedTypes,
      })),
    ],
    [columnConfigs],
  );

  const memoizedRows = useMemo(() => {
    const { entries, reversedEntries } = processTimeTableData(data);

    return rows.map(row => {
      const valueField = row.label || row.metric_name || '';
      const cellValues = columnConfigs.reduce<Record<string, ReactNode>>(
        (acc, columnConfig) => {
          if (columnConfig.colType === 'spark') {
            return {
              ...acc,
              [columnConfig.key]: (
                <Sparkline
                  valueField={valueField}
                  column={columnConfig}
                  entries={entries}
                />
              ),
            };
          }

          return {
            ...acc,
            [columnConfig.key]: (
              <ValueCell
                valueField={valueField}
                column={columnConfig}
                reversedEntries={reversedEntries}
              />
            ),
          };
        },
        {},
      );
      return {
        ...row,
        ...cellValues,
        metric: <LeftCell row={row} rowType={rowType} url={url} />,
      };
    });
  }, [columnConfigs, data, rowType, rows, url]);

  const defaultSort =
    rowType === 'column' && columnConfigs.length
      ? [
          {
            id: columnConfigs[0].key,
            desc: true,
          },
        ]
      : [];

  return (
    <TimeTableStyles
      data-test="time-table"
      className={className}
      height={height}
    >
      <TableView
        className="table-no-hover"
        columns={memoizedColumns}
        data={memoizedRows}
        initialSortBy={defaultSort}
        withPagination={false}
      />
    </TimeTableStyles>
  );
};

export default TimeTable;

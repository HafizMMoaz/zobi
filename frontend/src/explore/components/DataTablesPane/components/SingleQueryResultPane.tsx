import { useState, useCallback } from 'react';
import { styled } from '@zobi/core/theme';
import { GridTable } from 'src/components/GridTable';
import { GridSize } from 'src/components/GridTable/constants';
import {
  useGridColumns,
  useKeywordFilter,
  useGridHeight,
} from './useGridResultTable';
import { TableControls } from './DataTableControls';
import { SingleQueryResultPaneProp } from '../types';

const ResultPaneContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const GridContainer = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
`;

const GridSizer = styled.div`
  position: absolute;
  inset: 0;
`;

export const SingleQueryResultPane = ({
  data,
  colnames,
  coltypes,
  rowcount,
  datasourceId,
  canDownload,
  columnDisplayNames,
  rowLimit,
  rowLimitOptions,
  onRowLimitChange,
  onDownloadCSV,
  onDownloadXLSX,
  onReload,
}: SingleQueryResultPaneProp) => {
  const [filterText, setFilterText] = useState('');
  const { gridHeight, measuredRef } = useGridHeight();

  const columns = useGridColumns(colnames, coltypes, data, columnDisplayNames);
  const keywordFilter = useKeywordFilter(filterText);

  const handleInputChange = useCallback(
    (input: string) => setFilterText(input),
    [],
  );

  return (
    <ResultPaneContainer>
      <TableControls
        data={data}
        columnNames={colnames}
        columnTypes={coltypes}
        rowcount={rowcount}
        datasourceId={datasourceId}
        onInputChange={handleInputChange}
        isLoading={false}
        canDownload={canDownload}
        rowLimit={rowLimit}
        rowLimitOptions={rowLimitOptions}
        onRowLimitChange={onRowLimitChange}
        onDownloadCSV={onDownloadCSV}
        onDownloadXLSX={onDownloadXLSX}
        onReload={onReload}
      />
      <GridContainer>
        <GridSizer ref={measuredRef}>
          <GridTable
            data={data}
            columns={columns}
            height={gridHeight}
            size={GridSize.Small}
            externalFilter={keywordFilter}
            showRowNumber
          />
        </GridSizer>
      </GridContainer>
    </ResultPaneContainer>
  );
};

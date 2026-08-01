import { isDefined, QueryData } from '@zobi.dev/core';
import { css, styled } from '@zobi.dev/extension-api/theme';
import { t } from '@zobi.dev/extension-api/translation';
import { SingleQueryResultPane } from 'src/explore/components/DataTablesPane/components/SingleQueryResultPane';
import Tabs from '@zobi.dev/core/components/Tabs';

const ResultContainer = styled.div`
  ${() => css`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  `}
`;

export const useResultsTableView = (
  chartDataResult: QueryData[] | undefined,
  datasourceId: string,
  canDownload: boolean,
  onDownloadCSV?: () => void,
  onDownloadXLSX?: () => void,
  onReload?: () => void,
) => {
  if (!isDefined(chartDataResult)) {
    return <div />;
  }
  if (chartDataResult.length === 1) {
    return (
      <ResultContainer data-test="drill-by-results-table">
        <SingleQueryResultPane
          colnames={chartDataResult[0].colnames}
          coltypes={chartDataResult[0].coltypes}
          rowcount={chartDataResult[0].sql_rowcount}
          data={chartDataResult[0].data}
          datasourceId={datasourceId}
          isVisible
          canDownload={canDownload}
          onDownloadCSV={onDownloadCSV}
          onDownloadXLSX={onDownloadXLSX}
          onReload={onReload}
        />
      </ResultContainer>
    );
  }
  return (
    <Tabs
      defaultActiveKey="result-tab-0"
      items={chartDataResult.map((res, index) => ({
        key: `result-tab-${index}`,
        label: t('Results %s', index + 1),
        children: (
          <ResultContainer>
            <SingleQueryResultPane
              colnames={res.colnames}
              coltypes={res.coltypes}
              data={res.data}
              rowcount={res.sql_rowcount}
              datasourceId={datasourceId}
              isVisible
              canDownload={canDownload}
              onDownloadCSV={onDownloadCSV}
              onDownloadXLSX={onDownloadXLSX}
              onReload={onReload}
            />
          </ResultContainer>
        ),
      }))}
    />
  );
};

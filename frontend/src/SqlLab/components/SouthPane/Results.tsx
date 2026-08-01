import { FC, useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { EmptyState } from '@zobi-ui/core/components';
import { t } from '@zobi/core/translation';
import { FeatureFlag, isFeatureEnabled } from '@zobi-ui/core';
import { Alert } from '@zobi/core/components';
import { styled } from '@zobi/core/theme';

import { SqlLabRootState } from 'src/SqlLab/types';
import ResultSet from '../ResultSet';
import { LOCALSTORAGE_MAX_QUERY_AGE_MS } from '../../constants';
import QueryStatusBar from '../QueryStatusBar';

type Props = {
  latestQueryId?: string;
  displayLimit: number;
  defaultQueryLimit: number;
};

const StyledEmptyStateWrapper = styled.div`
  height: 100%;
  .ant-empty-image img {
    margin-right: 28px;
  }

  p {
    margin-right: 28px;
  }
`;

const Results: FC<Props> = ({
  latestQueryId,
  displayLimit,
  defaultQueryLimit,
}) => {
  const databases = useSelector(
    ({ sqlLab: { databases } }: SqlLabRootState) => databases,
    shallowEqual,
  );
  const queries = useSelector(
    ({ sqlLab: { queries } }: SqlLabRootState) => queries,
    shallowEqual,
  );
  const latestQuery = useMemo(
    () => queries[latestQueryId ?? ''],
    [queries, latestQueryId],
  );

  if (
    !latestQuery ||
    Date.now() - latestQuery.startDttm > LOCALSTORAGE_MAX_QUERY_AGE_MS
  ) {
    return (
      <StyledEmptyStateWrapper>
        <EmptyState
          title={t('Run a query to display results')}
          image="document.svg"
        />
      </StyledEmptyStateWrapper>
    );
  }

  const hasNoStoredResults =
    isFeatureEnabled(FeatureFlag.SqllabBackendPersistence) &&
    latestQuery.state === 'success' &&
    !latestQuery.resultsKey &&
    !latestQuery.results;

  if (hasNoStoredResults) {
    return (
      <Alert
        type="info"
        message={t('No stored results found, you need to re-run your query')}
      />
    );
  }

  return (
    <>
      <QueryStatusBar key={latestQueryId} query={latestQuery} />
      <ResultSet
        search
        queryId={latestQuery.id}
        database={databases[latestQuery.dbId]}
        displayLimit={displayLimit}
        defaultQueryLimit={defaultQueryLimit}
        showSql
        showSqlInline
      />
    </>
  );
};

export default Results;

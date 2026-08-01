import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'src/views/store';
import { isObject } from 'lodash';
import rison from 'rison';
import {
  ZobiClient,
  Query,
  runningQueryStateList,
  QueryResponse,
  QueryState,
  lruCache,
} from '@zobi.dev/core';
import { QueryDictionary, SqlLabRootState } from 'src/SqlLab/types';
import useInterval from 'src/SqlLab/utils/useInterval';
import {
  refreshQueries,
  clearInactiveQueries,
  queryFailed,
} from 'src/SqlLab/actions/sqlLab';
import type { DatabaseObject } from 'src/features/databases/types';

export const QUERY_UPDATE_FREQ = 2000;
const QUERY_UPDATE_BUFFER_MS = 5000;
const MAX_QUERY_AGE_TO_POLL = 21600000;
const QUERY_TIMEOUT_LIMIT = 10000;

export interface QueryAutoRefreshProps {
  queries: QueryDictionary;
  queriesLastUpdate: number;
}

// returns true if the Query.state matches one of the specific values indicating the query is still processing on server
export const isQueryRunning = (q: Query): boolean =>
  runningQueryStateList.includes(q?.state);

// returns true if at least one query is running and within the max age to poll timeframe
export const shouldCheckForQueries = (queryList: QueryDictionary): boolean => {
  let shouldCheck = false;
  const now = Date.now();
  if (isObject(queryList)) {
    shouldCheck = Object.values(queryList).some(
      q => isQueryRunning(q) && now - q?.startDttm < MAX_QUERY_AGE_TO_POLL,
    );
  }
  return shouldCheck;
};

function QueryAutoRefresh({
  queries,
  queriesLastUpdate,
}: QueryAutoRefreshProps) {
  // We do not want to spam requests in the case of slow connections and potentially receive responses out of order
  // pendingRequest check ensures we only have one active http call to check for query statuses
  const pendingRequestRef = useRef(false);
  const cleanInactiveRequestRef = useRef(false);
  const failedQueries = useRef(lruCache(1000));
  const databases = useSelector<SqlLabRootState>(
    ({ sqlLab }) => sqlLab.databases,
  ) as Record<string, DatabaseObject>;
  const asyncFetchDbs = useRef(
    new Set(
      Object.values(databases)
        .filter(({ allow_run_async }) => Boolean(allow_run_async))
        .map(({ id }) => id),
    ),
  );
  const dispatch = useAppDispatch();

  const checkForRefresh = () => {
    const shouldRequestChecking = shouldCheckForQueries(queries);
    if (!pendingRequestRef.current && shouldRequestChecking) {
      const params = rison.encode({
        last_updated_ms: queriesLastUpdate - QUERY_UPDATE_BUFFER_MS,
      });

      const controller = new AbortController();
      pendingRequestRef.current = true;
      ZobiClient.get({
        endpoint: `/api/v1/query/updated_since?q=${params}`,
        timeout: QUERY_TIMEOUT_LIMIT,
        parseMethod: 'json-bigint',
        signal: controller.signal,
      })
        .then(({ json }) => {
          if (json) {
            const jsonPayload = json as { result?: QueryResponse[] };
            if (jsonPayload?.result?.length) {
              const queries =
                jsonPayload?.result?.reduce(
                  (acc: Record<string, QueryResponse>, current) => {
                    acc[current.id] = current;
                    return acc;
                  },
                  {},
                ) ?? {};
              dispatch(refreshQueries(queries));
              jsonPayload.result.forEach(query => {
                const { id, dbId, state } = query;
                if (
                  asyncFetchDbs.current.has(dbId) &&
                  !failedQueries.current.has(id) &&
                  state === QueryState.Failed
                ) {
                  dispatch(
                    queryFailed(
                      query,
                      query.errorMessage ?? '',
                      query.extra?.errors?.[0]?.extra?.link,
                      query.extra?.errors,
                    ),
                  );
                  failedQueries.current.set(id, true);
                }
              });
            } else {
              dispatch(clearInactiveQueries(QUERY_UPDATE_FREQ));
            }
          }
        })
        .catch(() => {
          controller.abort();
        })
        .finally(() => {
          pendingRequestRef.current = false;
        });
    }
    if (!cleanInactiveRequestRef.current && !shouldRequestChecking) {
      dispatch(clearInactiveQueries(QUERY_UPDATE_FREQ));
      cleanInactiveRequestRef.current = true;
    }
  };

  // Solves issue where direct usage of setInterval in function components
  // uses stale props / state from closure
  // See comments in the useInterval.ts file for more information
  useInterval(() => {
    checkForRefresh();
  }, QUERY_UPDATE_FREQ);

  return null;
}

export default QueryAutoRefresh;

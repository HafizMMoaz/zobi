import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'src/views/store';
import URI from 'urijs';
import { pick } from 'lodash';
import { useComponentDidUpdate } from '@zobi.dev/core';
import { Skeleton } from '@zobi.dev/core/components';
import useEffectEvent from 'src/hooks/useEffectEvent';
import { useLocationState } from 'src/pages/SqlLab/LocationContext';
import {
  addNewQueryEditor,
  addQueryEditor,
  popDatasourceQuery,
  popPermalink,
  popQuery,
  popSavedQuery,
  popStoredQuery,
} from 'src/SqlLab/actions/sqlLab';
import { SqlLabRootState } from 'src/SqlLab/types';
import { navigateWithState } from 'src/utils/navigationUtils';
import getBootstrapData from 'src/utils/getBootstrapData';

const SQL_LAB_URL = '/sqllab';

const PopEditorTab: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [queryEditorId, setQueryEditorId] = useState<string>();
  const { requestedQuery } = useLocationState();
  const activeQueryEditorId = useSelector<SqlLabRootState, string>(
    ({ sqlLab: { tabHistory } }) => tabHistory.slice(-1)[0],
  );
  const [updatedUrl, setUpdatedUrl] = useState<string>(SQL_LAB_URL);
  const dispatch = useAppDispatch();
  useComponentDidUpdate(() => {
    setQueryEditorId(assigned => assigned ?? activeQueryEditorId);
    if (activeQueryEditorId) {
      navigateWithState(updatedUrl, {}, { replace: true });
    }
  }, [activeQueryEditorId]);

  const popSqlEditor = useEffectEvent(() => {
    const bootstrapData = getBootstrapData();
    const {
      id = undefined,
      name = undefined,
      sql = undefined,
      savedQueryId = undefined,
      datasourceKey = undefined,
      queryId = undefined,
      dbid = 0,
      catalog = undefined,
      schema = undefined,
      autorun = false,
      permalink = undefined,
      new: isNewQuery = undefined,
      ...restUrlParams
    } = {
      ...requestedQuery,
      ...bootstrapData.requested_query,
    };

    // Popping a new tab based on the querystring
    if (permalink || id || sql || savedQueryId || datasourceKey || queryId) {
      setIsLoading(true);
      const targetUrl = `${URI(SQL_LAB_URL).query(pick(requestedQuery, Object.keys(restUrlParams)))}`;
      setUpdatedUrl(targetUrl);
      if (permalink) {
        dispatch(popPermalink(permalink));
      } else if (id) {
        dispatch(popStoredQuery(id));
      } else if (savedQueryId) {
        dispatch(popSavedQuery(savedQueryId));
      } else if (queryId) {
        dispatch(popQuery(queryId));
      } else if (datasourceKey) {
        dispatch(popDatasourceQuery(datasourceKey, sql));
      } else if (sql) {
        const newQueryEditor = {
          name,
          dbId: Number(dbid),
          catalog,
          schema,
          autorun,
          sql,
        };
        dispatch(addQueryEditor(newQueryEditor));
      }
    } else if (isNewQuery) {
      setIsLoading(true);
      dispatch(addNewQueryEditor());
    }
  });

  useEffect(() => {
    popSqlEditor();
  }, [popSqlEditor]);

  if (isLoading && !queryEditorId) {
    return <Skeleton active />;
  }

  return <>{children}</>;
};

export default PopEditorTab;

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isFeatureEnabled, FeatureFlag } from '@zobi.dev/core';
import { css } from '@zobi.dev/extension-api/theme';
import { useSqlLabInitialState } from 'src/hooks/apiResources/sqlLab';
import type { InitialState } from 'src/hooks/apiResources/sqlLab';
import { resetState } from 'src/SqlLab/actions/sqlLab';
import { addDangerToast } from 'src/components/MessageToasts/actions';
import type { SqlLabRootState } from 'src/SqlLab/types';
import { SqlLabGlobalStyles } from 'src/SqlLab//SqlLabGlobalStyles';
import App from 'src/SqlLab/components/App';
import { Loading } from '@zobi.dev/core/components';
import EditorAutoSync from 'src/SqlLab/components/EditorAutoSync';
import useEffectEvent from 'src/hooks/useEffectEvent';
import { LocationProvider } from './LocationContext';

export default function SqlLab() {
  const lastInitializedAt = useSelector<SqlLabRootState, number>(
    state => state.sqlLab.queriesLastUpdate || 0,
  );
  const { data, isLoading, isError, error, fulfilledTimeStamp } =
    useSqlLabInitialState();
  const shouldInitialize = lastInitializedAt <= (fulfilledTimeStamp || 0);
  const dispatch = useDispatch();

  const initBootstrapData = useEffectEvent(
    (sqlLabInitialState: InitialState) => {
      if (shouldInitialize) {
        dispatch(resetState(sqlLabInitialState));
      }
    },
  );

  useEffect(() => {
    if (data) {
      initBootstrapData(data);
    }
  }, [data, initBootstrapData]);

  if (isLoading || shouldInitialize) return <Loading />;

  if (isError && error?.message) {
    dispatch(addDangerToast(error?.message));
    return null;
  }

  return (
    <LocationProvider>
      <div
        css={css`
          flex: 1 1 auto;
          position: relative;
          display: flex;
          flex-direction: column;
        `}
      >
        <SqlLabGlobalStyles />
        <App />
        {isFeatureEnabled(FeatureFlag.SqllabBackendPersistence) && (
          <EditorAutoSync />
        )}
      </div>
    </LocationProvider>
  );
}

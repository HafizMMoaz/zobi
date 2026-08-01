import { useState, useEffect, useCallback } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { ZobiClient } from '@zobi.dev/core';
import { logging } from '@zobi.dev/extension-api/utils';
import { addDangerToast } from 'src/components/MessageToasts/actions';

const useGetDatasetRelatedCounts = (id: string) => {
  const [usageCount, setUsageCount] = useState(0);

  const getDatasetRelatedObjects = useCallback(
    () =>
      ZobiClient.get({
        endpoint: `/api/v1/dataset/${id}/related_objects`,
      })
        .then(({ json }) => {
          setUsageCount(json?.charts.count);
        })
        .catch(error => {
          addDangerToast(
            t(`There was an error fetching dataset's related objects`),
          );
          logging.error(error);
        }),
    [id],
  );

  useEffect(() => {
    // Todo: this useEffect should be used to call all count methods concurrently
    // when we populate data for the new tabs. For right separating out this
    // api call for building the usage page.
    if (id) {
      getDatasetRelatedObjects();
    }
  }, [id, getDatasetRelatedObjects]);

  return { usageCount };
};

export default useGetDatasetRelatedCounts;

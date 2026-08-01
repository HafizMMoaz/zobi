import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import { last } from 'lodash';
import rison from 'rison';
import { parse as parseContentDisposition } from 'content-disposition';
import { t } from '@zobi/core/translation';
import { ZobiClient, ZobiApiError } from '@zobi-ui/core';
import { logging } from '@zobi/core/utils';
import {
  LOG_ACTIONS_DASHBOARD_DOWNLOAD_AS_IMAGE,
  LOG_ACTIONS_DASHBOARD_DOWNLOAD_AS_PDF,
} from 'src/logger/LogUtils';
import { RootState } from 'src/dashboard/types';
import { getDashboardUrlParams } from 'src/utils/urlUtils';
import { DownloadScreenshotFormat } from '../components/menu/DownloadMenuItems/types';

const RETRY_INTERVAL = 3000;
const MAX_RETRIES = 30;

export const useDownloadScreenshot = (
  dashboardId: number,
  logEvent?: Function,
) => {
  const activeTabs = useSelector(
    (state: RootState) => state.dashboardState.activeTabs || undefined,
  );
  const anchor = useSelector(
    (state: RootState) =>
      last(state.dashboardState.directPathToChild) || undefined,
  );
  const dataMask = useSelector(
    (state: RootState) => state.dataMask || undefined,
  );

  const { addDangerToast, addSuccessToast, addInfoToast } = useToasts();

  const currentIntervalIds = useRef<NodeJS.Timeout[]>([]);

  const stopIntervals = useCallback(
    (message?: 'success' | 'failure') => {
      currentIntervalIds.current.forEach(clearInterval);

      if (message === 'failure') {
        addDangerToast(
          t('The screenshot could not be downloaded. Please, try again later.'),
        );
      }
      if (message === 'success') {
        addSuccessToast(t('The screenshot has been downloaded.'));
      }
    },
    [addDangerToast, addSuccessToast],
  );

  const downloadScreenshot = useCallback(
    (format: DownloadScreenshotFormat) => {
      let retries = 0;
      let isFetching = false;
      let isDownloaded = false;

      const toastIntervalId = setInterval(
        () =>
          addInfoToast(
            t(
              'The screenshot is being generated. Please, do not leave the page.',
            ),
            { noDuplicate: true },
          ),
        RETRY_INTERVAL,
      );

      currentIntervalIds.current = [
        ...(currentIntervalIds.current || []),
        toastIntervalId,
      ];

      const checkImageReady = (cacheKey: string) =>
        ZobiClient.get({
          endpoint: `/api/v1/dashboard/${dashboardId}/screenshot/${cacheKey}/?download_format=${format}`,
          headers: { Accept: 'application/pdf, image/png' },
          parseMethod: 'raw',
        })
          .then((response: Response) => {
            const disposition = response.headers.get('Content-Disposition');
            let fileName = `screenshot.${format}`; // default filename

            if (disposition) {
              try {
                const parsed = parseContentDisposition(disposition);
                if (parsed?.parameters?.filename) {
                  fileName = parsed.parameters.filename;
                }
              } catch (error) {
                console.warn(
                  'Failed to parse Content-Disposition header:',
                  error,
                );
              }
            }

            return response.blob().then(blob => ({ blob, fileName }));
          })
          .then(({ blob, fileName }) => {
            if (isDownloaded) {
              return;
            }
            isDownloaded = true;
            stopIntervals('success');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          })
          .catch(err => {
            if ((err as ZobiApiError).status === 404) {
              throw new Error('Image not ready');
            }
          });

      const fetchImageWithRetry = (cacheKey: string) => {
        if (isDownloaded || isFetching) {
          return;
        }
        if (retries >= MAX_RETRIES) {
          stopIntervals('failure');
          logging.error('Max retries reached');
          return;
        }
        isFetching = true;
        checkImageReady(cacheKey)
          .catch(() => {
            retries += 1;
          })
          .finally(() => {
            isFetching = false;
          });
      };

      ZobiClient.post({
        endpoint: `/api/v1/dashboard/${dashboardId}/cache_dashboard_screenshot/?q=${rison.encode({ force: true })}`,
        jsonPayload: {
          anchor,
          activeTabs,
          dataMask,
          urlParams: getDashboardUrlParams(),
        },
      })
        .then(({ json }) => {
          const cacheKey = json?.cache_key;
          if (!cacheKey) {
            throw new Error('No image URL in response');
          }
          const retryIntervalId = setInterval(() => {
            fetchImageWithRetry(cacheKey);
          }, RETRY_INTERVAL);
          currentIntervalIds.current.push(retryIntervalId);
          fetchImageWithRetry(cacheKey);
        })
        .catch(error => {
          logging.error(error);
          stopIntervals('failure');
        })
        .finally(() => {
          logEvent?.(
            format === DownloadScreenshotFormat.PNG
              ? LOG_ACTIONS_DASHBOARD_DOWNLOAD_AS_IMAGE
              : LOG_ACTIONS_DASHBOARD_DOWNLOAD_AS_PDF,
          );
        });
    },
    [
      dashboardId,
      anchor,
      activeTabs,
      dataMask,
      addInfoToast,
      stopIntervals,
      logEvent,
    ],
  );

  useEffect(
    () => () => {
      if (currentIntervalIds.current.length > 0) {
        stopIntervals();
      }
      currentIntervalIds.current = [];
    },
    [stopIntervals],
  );

  return downloadScreenshot;
};
